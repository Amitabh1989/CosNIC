"""
:mod:`test_module` -- Test script module
========================================

.. module:: controller.cuw.test_script
.. moduleauthor:: Eugene Cho <echo@broadcom.com>

This is a base module of test scripts.

"""

__doc__ = """
This is a base module of test scripts.
"""

__changeset__ = """
ID               WHO         WHEN(MM/DD/YY)   COMMENTS
==============================================================================
DCSG_ALL_ERS     Team        05/05/24         All check-ins till date
DCSG01670976     asuman      05/06/24         [Tests]: Interface module between prereq data and pre req apis
DCSG01727384     sekhar      05/29/24         [Tests]: Disable and stop lldp service at the start of the test
DCSG01326140     subbu       05/30/24         added to validate dmesg after cleanup
DCSG01685681     Aswanth     06/03/24         BCM SOS report generate when test case failed
"""

import copy
import logging
import os
import pathlib
import re
import sys
import time
from functools import wraps
from logging.handlers import SocketHandler
from typing import Dict, Union

from controller.cuw.test_script.config import Munchfied, get_attr_params
from controller.cuw.test_script.tsl.common.misc import host_logs
from controller.cuw.test_script.tsl.common.pre_req.result_exchange import ResultExchange
from controller.cuw.test_script.tsl.common.release import get_release_handler
from controller.cuw.test_script.tsl.common.system import reboot, validation
from controller.cuw.test_script.tsl.common.tools import nic_conf_util as nvm_mod
from controller.cuw.test_script.tsl.linux.system import grub, kdump
from controller.cuw.test_script.tsl.vmkernel.virt.vswitch import delete_all_vswicthes
from controller.lib.core import exception, telnet
from controller.lib.core.param.host import SUT, Client
from controller.lib.host import client
from controller.misc.sms.tc_data import TCData
from munch import munchify

__version__ = "1.0.0"  # PEP 8. Also check PEP 386 for the format.
__copyright__ = "Copyright (C) 2009-2024 Broadcom Inc"

log = logging.getLogger(__name__)


def setup_logging():
    # Configure the logger
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)  # Set the minimum logging level

    # Create a formatter with the desired format
    formatter = logging.Formatter(
        fmt="%(asctime)s.%(msecs)03d %(levelname)-8s %(module)s - %(funcName)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # File handler for logging to a file
    file_handler = logging.FileHandler("HISTORYlistener.log")
    file_handler.setFormatter(formatter)
    file_handler.flush = (
        lambda: None
    )  # Add flush method to ensure logs are written immediately
    logger.addHandler(file_handler)

    # Stream handler for logging to the console
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    # Create a socket handler
    # socket_handler = logging.handlers.SocketHandler(
    socket_handler = SocketHandler(
        "localhost", 9999
    )  # Replace with your log server address and port
    logger.addHandler(socket_handler)

    return logger
    # for i in range(200):
    #     logger.info(
    #         f"Hello, world! We are live logging via websockets {i} :  random_id : {rand_num}"
    #     )
    #     time.sleep(0.2)


log = setup_logging()


class TestBase:
    """
    Base class. Run method of this class instead of the function "run()" so
    reduce maintenance in the case that all test case modules need to be
    updated.

    """

    def __init__(self, params, tms_info, *args, **kwargs):
        # Create a self.params
        self._raw_params = params
        self.stat_testcase_info = tms_info
        self.stat_input_variables = None
        self._sut = None
        self.comment = []
        self.params = None
        self.overall_result = None
        self._nodes: Dict[str, Union[SUT, Client]] = {}
        self._host_stats = {}
        self._old_stats = {}
        self._speed_before = {}
        self._speed_after = {}
        self._init_iface = True
        self.subtest_results = {}

        # data structure for SMS submission
        self.sms_tc_data = TCData(testbase=self)
        self.start_time_sec = (
            time.time()
        )  # Test case start time, in seconds since the epoch

    @property
    def sut(self):
        log.warning("self.sut will be obsolete. Do not use this")
        return self._sut

    @property
    def init_iface(self):
        return self._init_iface

    @staticmethod
    def unittest():
        """
        This is a method which will be called by GitLab CI whenever
        "push" happens. Override as necessary. By default, return True.

        Returns:
            bool: True if successful otherwise False

        """
        return True

    def get_sysinfo(self):
        """Collect system information from object type host parameters. Must
        be called after self.param is updated.

        """
        if not self.params:
            log.warning("self.params is None. Do nothing.")
            return

        for key, value in self.params.__dict__.items():
            if isinstance(value, SUT):
                # Collect system information
                self._sut = value
                self._nodes[key] = value
            elif isinstance(value, Client):
                self._nodes[key] = value

        if not self._sut:
            log.warning("No SUT is found. No system information will be submitted")

    @staticmethod
    def __suppress_stack_trace(sut, suppress=True):
        """
        A private method to suppress/allow the printing of stack trace on exceptions.

        Args:
            sut: The SUT on which to suppress/allow printing of exceptions.
            suppress: True to suppress the stack trace; False to allow.
        """
        s = sut.import_module("sys")
        s.tracebacklimit = 0 if suppress is True else None

    @staticmethod
    def check_tc_preReq_result(stat_testcase_id: str) -> bool:
        """
        Check the pre-requisite results for a test case. As per current requirement,
        send return as True only when pre-req for whole Test Suite has met requirement.

        For even 1 single TC not meeting pre-re, send False for all.

        Args:
            stat_testcase_id (str): The test case ID.

        Returns:
            bool: True if all pre-requisites are met, False otherwise.
        """
        if stat_testcase_id == "00000":
            return True

        result_exchange = ResultExchange()
        log.info(
            f">>> PreReq report for TC ID {stat_testcase_id} is {result_exchange.get_result(stat_testcase_id)}"
        )

        for result in result_exchange._result.values():
            if not result.get("result", True):
                return False

        return True

    def get_os_type(self, host):
        platform = host.import_module("platform")
        try:
            os_type = self.params.os_type
        except Exception:
            os_type = platform.system()
        return os_type

    def get_mgmt_ip_list(self, node_list=None):
        if node_list is None:
            node_list = list(self._nodes.values())
        mgmt_ip_addr_list = []
        for host in node_list:
            mgmt_ip_addr_list.append(host.mgmt_ip_addr)
        return mgmt_ip_addr_list

    def get_mac_addr_list(self, node_list=None):
        if node_list is None:
            node_list = list(self._nodes.values())
        mac_addr_list = []
        for host in node_list:
            for iface in host.iface_list:
                mac_addr_list.append(iface.mac_addr)
        return mac_addr_list

    def start(self, **kwargs):
        """A wrapper method of run().

        Run pre and post actions around run(), such as returning string "Pass"
        and "Fail" as well as handling exceptions.

        """
        result = True
        # Initialize logging
        logging.basicConfig(
            format="%(asctime)s|%(levelname)-8s|%(message)s", level=logging.INFO
        )

        # region get test case log folder name
        # CLI can be launched by: STAT test runner, SMS test runner, python IDE, pytest
        try:
            # attempt to parse SMS test runner command line arguments
            # if applicable, then self.sms_tc_data.log_folder is not None
            self.sms_tc_data.parse_cli_args()
            if self.sms_tc_data.log_folder is not None:
                self.sms_tc_data.set_log_basic_config()
                GlobalVars.log_folder = self.sms_tc_data.log_folder
                log.info("Launched by SMS test runner")
            else:
                # check if it is launched by pytest
                log_folder_name = None
                for handler in logging.getLogger().handlers:
                    if isinstance(handler, logging.FileHandler):
                        if handler.baseFilename.endswith((".log", ".txt")):
                            log_folder_name = os.path.dirname(handler.baseFilename)
                            GlobalVars.log_folder = log_folder_name
                            log.info("Launched by pytest")

                if log_folder_name is None:
                    # launched by python IDE
                    if GlobalVars.log_folder is not None:
                        log_level = logging.DEBUG
                        if len(logging.root.handlers) > 0:
                            logging.root.handlers = []
                            log_file = (
                                str(GlobalVars.log_folder)
                                .replace("\\", "/")
                                .rstrip("/")
                                + "/sms_log_local.txt"
                            )
                            logging.basicConfig(
                                format="%(asctime)s|%(levelname)s|%(name)s|%(message)s",
                                level=log_level,
                                handlers=[
                                    logging.FileHandler(log_file),
                                    logging.StreamHandler(),
                                ],
                            )
                            log.info("Launched by python IDE")
                    else:
                        raise Exception(
                            "Error: Launched by python IDE. "
                            "TestBase GlobalVars.log_folder is not defined. "
                            "Usage: Need to set in <test script> > __main__ > "
                            "from controller.cuw.test_script import GlobalVars"
                            "GlobalVars.log_folder = = <your log folder>"
                        )

            log.info(f"Log folder: {GlobalVars.log_folder}")
        except Exception:
            log.exception("Failed to get test case log folder name")
            GlobalVars.result_code = "Abort"
            return "Abort"
        # end region

        try:
            # Check for the pre-requisite result for the test case. If pre-req has failed,
            # fail the test case. Proceed only when it has passed.
            _result = TestBase.check_tc_preReq_result(self.stat_testcase_info["id"])
            if _result:
                log.info("Test Case Details = %s", self.stat_testcase_info)
                # Backing up kwargs['init_iface'] value as we are setting it to False
                # so that connect() routine shouldn't initialize interfaces on host if host is VMKernel
                self._init_iface = kwargs.get("init_iface", True)
                self.params = get_attr_params(
                    self._raw_params, self.stat_testcase_info, **kwargs
                )
                self._sut = self.params.sut
                self.get_sysinfo()
                # If os_type is VMkernel, cleanup existing vSwitch configurations before initializing iface
                for node in list(self._nodes.values()):
                    os_type = self.get_os_type(node)
                    if os_type.lower() == "vmkernel":
                        log.info(
                            f"Initiating VM cleanup on host {node.name}:{node.mgmt_ip_addr}"
                        )
                        self.cleanup_vms(node, collect_vm_logs=False)
                        # Cleaning up existing vSwitch configurations before initializing iface
                        log.info(
                            f"Cleanup existing vSwitch configurations on {node.name}:{node.mgmt_ip_addr}"
                        )
                        delete_all_vswicthes(node)
                if self.params.os_platform.lower() == "vmkernel":
                    kwargs["init_iface"] = (
                        self._init_iface
                    )  # restoring kwargs['init_iface'] value
                if self.params.os_platform.lower() == "vmkernel" and self._init_iface:
                    for node in list(self._nodes.values()):
                        node.set_iface_list()

                # Validate Management IPs and MACs
                log.info("Validating Management IPs and MACs")
                mac_addr_list = self.get_mac_addr_list()
                mgmt_ip_addr_list = self.get_mgmt_ip_list()
                if len(mac_addr_list) != len(list(set(mac_addr_list))):
                    raise exception.ConfigException(
                        f"ConfigException: MAC address should not be same."
                        f"\nDebug: MAC address List = {mac_addr_list}"
                    )
                if len(mgmt_ip_addr_list) != len(list(set(mgmt_ip_addr_list))):
                    raise exception.ConfigException(
                        f"ConfigException: Management IPs should not be same."
                        f"\nDebug: Management IP Address List = {mgmt_ip_addr_list}"
                    )

                for node in list(self._nodes.values()):
                    host_logs.clear_host_stat_server_logs(node)
                    node.cntl = node.import_module("controller")
                    log.info(
                        "########## Controller package version on %s is %s ###########"
                        % (node.name, node.cntl.__version__)
                    )
                    node.sys = node.import_module("sys")
                    log.info(
                        "########## Python version on %s is %s ###########"
                        % (node.name, node.sys.version.split(" ")[0])
                    )
                # Suppress the printing of stack trace on python exceptions.
                for node in list(self._nodes.values()):
                    if getattr(self.params.common, "suppress_traceback", True):
                        log.info(
                            "Suppressing stack trace reporting on %s"
                            % node.mgmt_ip_addr
                        )
                        self.__suppress_stack_trace(node)

                os_type = self.get_os_type(self._sut)
                self.log_host_details()

                if getattr(self.params.common, "enable_kdump", False):
                    kdump.enable_kdump(self.params.sut)
                time.sleep(5)  # Sleep 5 sec before start running

                # Adding IOMMU command-line parameters to enable SRIOV and Passthrough
                # For Preboot iPXE tests SUT will be having Linux OS and grub param change should be skipped
                if os_type == "Linux" and self.params.os_platform != "Preboot":
                    for node in list(self._nodes.values()):
                        # Disabling and stopping the lldp service at the starting of the test DCSG01727384
                        service = node.import_module(
                            "controller.lib.linux.system.service"
                        )
                        lldpad = service.Service("lldpad")
                        # handle lldpad service does not exist on some systems
                        try:
                            if lldpad.status:
                                log.info("lldpad service is running, stopping it")
                                lldpad.stop()
                            enabled = lldpad.isenabled()
                            if enabled:
                                log.info("lldpad service is enabled, disabling it")
                                lldpad.disable()
                        except Exception as ex:
                            log.warning(f"Exception {str(ex)}")

                        lscpu_info = host_logs.get_linux_lscpu(node)
                        # ER: DCSG01695042 -- As per this Enabling iommu by default on AMD systems only.
                        if lscpu_info["Vendor_ID"] == "AuthenticAMD":
                            log.info(
                                "########## Modifying grub for SRIOV-Passthrough on %s ###########"
                                % node.name
                            )
                            grub.grub_parameter_insertion(node)

                # Clear dmesg logs on all the nodes before starting the test.
                validation.clear_dmesg_logs(self._nodes.values(), self.init_iface)

                # As per dev team, if MAD is enabled, it may cause race around condition in Back-to-Back connections.
                # And it is advised to disable for Back-to-Back connections. MAD is designed to work best
                # for switch scenarios.
                # And in our setups, occasionally, link is failed to come up due to above the said reason.
                # So, to address this problem, MAD is disabled on clients, which is enough to resolve the link issue.
                if (
                    self.params.common.disable_media_auto_detect is True
                    and self.params.switch_config.switch_topology is False
                ):
                    from controller.cuw.test_script.tsl.common.tools import (
                        nic_conf_util,
                    )

                    for node in list(self._nodes.values()):
                        if isinstance(node, Client):
                            ncutil_obj = nic_conf_util.NicConfUtil(node, self.params)
                            log.info(f"Disabling media-auto-detect on {node.name}")
                            ncutil_obj.configure_nvm_option(
                                node,
                                option_name=["media_auto_detect"],
                                option_value=["Disabled"],
                            )

                skip_set_ip_addr_on_host = kwargs.get("skip_set_ip_addr_on_host", False)
                if skip_set_ip_addr_on_host is False and self.init_iface is True:
                    if os_type in ["Linux", "FreeBSD"]:
                        self.set_ip_addr(self._nodes.values())
                    if os_type == "VMkernel":
                        self.set_ip_addr(self._nodes.values(), 1, base_iface=True)
                    if os_type == "Windows":
                        self.set_ip_addr(self._nodes.values())
                if (
                    self.init_iface
                    and skip_set_ip_addr_on_host is False
                    and self.params.pre_post_validations.ping
                    and not (
                        self.params.os_platform == "Linux"
                        and self.params.rdma.hammer.switch_pre_configured is True
                    )
                ):
                    current_topology = self.params.topology
                    if current_topology in ["sut-client", "sut-client-client_2"]:
                        validation.ping_test(self)
                before_file_name = {}
                for host in self._nodes.values():
                    os_type = self.get_os_type(host)
                    if os_type in ["Linux"] and self.params.os_platform != "Preboot":
                        nvm_obj = nvm_mod.NicConfUtil(host, self.params)
                        before_file_name[host] = nvm_obj.backup_nvm_config(
                            host, self.stat_testcase_info
                        )

                log.info(
                    "\n#############################################\n"
                    "########## PRE-TEST COMPLETE - RUN ##########\n"
                    "#############################################"
                )
                result = self.run()

            if result is None:  # No returned result. Coding error.
                raise exception.ValueException('Returned result is "None"')

            if not _result:
                result = "Fail"
                GlobalVars.result_code = "Abort"
                self.comment.append(
                    f">>> PreRequisite not met for {self.stat_testcase_info['id']}"
                )
            else:
                GlobalVars.result_code = "Pass" if result else "Fail"

            return GlobalVars.result_code
        except exception.TestCaseFailure as err:
            log.error("FAIL: %s" % err)
            # log.info('-' * 50)
            # log.info('* Test Result: Fail')
            self.comment.append(str(err))
            GlobalVars.result_code = "Fail"
            return "Fail"
        except exception.STATException as err:
            log.error("FAIL: %s" % err)
            # log.info('-' * 50)
            # log.info('* Test Result: Abort')
            self.comment.append(str(err))
            GlobalVars.result_code = "Abort"
            return "Abort"
        except Exception as err:
            log.error("non-STAT exceptions. Error: %s" % err)
            import traceback

            log.error(traceback.format_exc())
            self.comment.append(str(traceback.format_exc()))
            GlobalVars.result_code = "Abort"
            return "Abort"
        finally:
            # CTRL-40928: Need to capture dmesg logs and coredump when a test script failed or
            # aborted.
            # Examine dmesg logs after the test and flag any errors. Also, if the test has not
            # PASSED, generate core dump file on each of the SUT's.
            log.info(
                "\n####################################################\n"
                "########## RUN COMPLETE - START POST-TEST ##########\n"
                "####################################################"
            )
            try:
                # generate coredump when main test gets failed
                if GlobalVars.result_code == "Fail":
                    self.to_generate_coredump(
                        subtest_result=None,
                        subtest_name=None,
                        test_case_details=self.stat_testcase_info,
                    )
            except Exception:
                log.warning(f"Unable to generate core dump")
            os_type = self.get_os_type(self._sut)
            # generate bcm_sosreport when test fails
            if (
                os_type in ["Linux"]
                and self.params.pre_post_validations.generate_bcm_sosreport is True
            ):
                self.generate_bcm_sosreport()

            if self.params.os_platform != "Preboot":
                if (
                    GlobalVars.result_code != "Pass"
                    and not self.params.cleanup_on_failure
                ):
                    log.info(
                        "Skipping Test Cleanup from TestBase class upon failure as instructed by User"
                    )
                else:
                    self.params.common.reload_driver = self.params["common"].get(
                        "reload_driver", False
                    )
                    if (
                        GlobalVars.result_code != "Pass"
                        and not self.params.common.reload_driver
                    ):
                        log.warning(
                            f"Test verdict is {GlobalVars.result_code}, modifying "
                            f"self.params.common.reload_driver from {self.params.common.reload_driver} to True "
                            f"to perform reloading the drivers for failed test case"
                        )
                        self.params.common.reload_driver = True

                    for host in self._nodes.values():
                        try:
                            self.cleanup([host])
                        except Exception as exc:
                            log.error(
                                f"Final Result will be updated as FAIL as cleanup failed for {host.name} "
                                f"with exception: {str(exc)}"
                            )
                            GlobalVars.result_code = "Fail"
                            log.info(f"Rebooting {host.name} due to the failed cleanup")
                            try:
                                reboot(
                                    host=host,
                                    reboot_timeout=self.params.common.reboot_timeout,
                                    init_iface=self.init_iface,
                                )
                            except Exception as err:
                                log.warning(
                                    f"Failed to reboot {host.name}. Error: {str(err)}"
                                )

                    log.info("Re-verifying the dmesg after driver reload")
                    validation.validate_dmesg(
                        list(self._nodes.values()),
                        params=self.params,
                        chk_for_vmk_dmesg=self.init_iface,
                    )
                try:
                    for node in list(self._nodes.values()):
                        host_logs.get_host_stat_server_logs(node)
                except Exception as err:
                    log.warning("Unable to generate host logs. Error: %s" % err)

            for host in self._nodes.values():
                os_type = self.get_os_type(host)
                if os_type in ["Linux"] and self.params.os_platform != "Preboot":
                    try:
                        nvm_obj = nvm_mod.NicConfUtil(host, self.params)
                        nvm_obj.compare_and_restore(
                            host, before_file_name[host], self.stat_testcase_info
                        )
                    except Exception:
                        log.warning(f"Unable to restore NVM in  {host.name} machine ")

            for host in client.HostHandler.host_list:
                host.disconnect()
            for telnet_handler in telnet.TelnetHandler.telnet_handler_list:
                telnet_handler.disconnect()

            log.info("-" * 50)
            log.info(f"* Test Result: {GlobalVars.result_code}")
            log.info(
                f"************* FINAL RESULT : {GlobalVars.result_code} ************"
            )
            log.info("\t\tSubtest_Name\t\tVerdict\t\tTime taken(Seconds)\t\t")
            for subtest, subtest_result in self.subtest_results.items():
                log.info("\t\t%s\t\t\t%s" % (subtest, "\t\t".join(subtest_result)))
            log.info("*" * 42)

            # region Create data for SMS
            log.info(
                "\n####################################################\n"
                "##########       Create data for SMS      ##########\n"
                "####################################################"
            )
            # script_abs_path: str. Absolute path of the test script.
            # Ex: C:/<some path>/controller/cuw/test_script/windows/ras/QA_Controller_56997.py
            callers_path = sys._getframe(1).f_globals["__file__"]

            self.sms_tc_data.load_info(
                script_abs_path=callers_path, log_folder_name=str(GlobalVars.log_folder)
            )

            test_comments = "\n".join(self.comment)
            end_time_sec = time.time()
            self.sms_tc_data.load_exit_data(
                verdict=str(GlobalVars.result_code),
                end_time_sec=end_time_sec,
                test_comments=test_comments,
            )

            self.sms_tc_data.create_json_file()
            self.sms_tc_data.create_xml_file()
            # endregion

    def run(self):
        raise NotImplementedError  # Should be overriden

    def set_ip_addr(self, *args, **kwargs):
        raise NotImplementedError  # Should be overriden

    def process_result(self, test_name, result, subtest_time):
        self.subtest_results[test_name] = [result, subtest_time]
        if result == "Pass":
            log.info("##################################################")
            log.info(
                "#########    {} is PASSED    ##############".format(test_name.upper())
            )
            log.info("##################################################")
        elif result == "Fail":
            log.info(
                "########################################################################"
            )
            log.error("Subtest {} is FAILED".format(test_name))
            raise exception.SubTestFailed(
                "############    Subtest {} is FAILED      #########".format(test_name)
            )
        else:
            log.error('Result should only be "Pass" or "Fail"')
            raise Exception

    def log_host_details(self):
        os_type = self.get_os_type(self._sut)
        if os_type == "Linux":
            host_logs.get_linux_host_details(self._sut)
        if os_type == "VMkernel":
            host_logs.esxi_details(self._sut, self._sut.iface_list, self.params)
        elif os_type == "Windows":
            host_logs.get_windows_host_details(self._sut, self.params)

    def to_generate_coredump(
        self, subtest_result=None, subtest_name=None, test_case_details=None
    ):
        if not self.params.pre_post_validations.generate_coredump:
            return
        nodes_coredumps_dict = {}
        subtest_name = "MainTest" if subtest_name is None else subtest_name
        coredump_file_name = (
            "_"
            + test_case_details["tms_testcase_id"]
            + "_"
            + subtest_name.upper()
            + ".core"
        )
        if self.params.os_platform == "Windows":
            log.warning("For Windows, coredump is generated only on SUT")
            sut = self.params.sut
            nodes_coredumps_dict.setdefault(sut, {})[sut.iface_list[0].name] = (
                validation.generate_coredump(
                    sut, self.params, coredump_file_name=coredump_file_name
                )
            )
        else:
            coredump_on_client = not (
                subtest_result
                and not self.params.pre_post_validations.coredump_on_client
            )
            nodes_coredumps_dict = validation.generate_coredump_on_all_nics(
                list(self._nodes.values()),
                self.params,
                coredump_on_client=coredump_on_client,
                coredump_file_name=coredump_file_name,
            )
        if nodes_coredumps_dict and self.params.pre_post_validations.decode_coredump:
            for node, ifaces_coredumps in nodes_coredumps_dict.items():
                for iface_name, coredump_file in ifaces_coredumps.items():
                    log.info(f"Decoding coredump of {iface_name} of {node.name}")
                    validation.validate_coredump(node, coredump_file, self.params)

    def generate_bcm_sosreport(self):
        def install_bcm_sosreport_util(host):
            try:
                log.info(f"Installing bcm sos report on {host.name}")
                current_sos_version = []
                rel = get_release_handler(
                    host, self.params.sit.release_path, self.params
                )
                drv_path = rel.get_bcm_sosreport(
                    self.params.sit.release_stream, self.params.sit.release_version
                )
                path = pathlib.Path(drv_path).name
                sos_version = re.search("[-|_]([0-9.]*)-", path).group(1)
                sosexec_path = host.import_module("distutils.spawn").find_executable(
                    "bcm_sosreport"
                )
                host_exe = host.import_module("controller.lib.common.shell.exe")
                if sosexec_path:
                    current_sos_version = (
                        host_exe.block_run("dpkg -l bcm-sosreport")
                        if drv_path.endswith("deb")
                        else host_exe.block_run("rpm -q bcm_sosreport")
                    )
                if sos_version not in current_sos_version:
                    file_name = host.download_file(drv_path)
                    if file_name.endswith("deb"):
                        host_exe.block_run(f"dpkg --force-all -i {file_name}")
                    else:
                        host_exe.block_run(
                            f"rpm -ivh {file_name} --nodeps --force --upgrade"
                        )
            except Exception as err:
                log.warning("Unable to install bcm sosreport. Error: %s" % err)

        for host in list(self._nodes.values()):
            ncutil_obj = nvm_mod.NicConfUtil(host, self.params)
            formated_sit_fw_ver = list(
                ncutil_obj.format_fw_version(
                    ncutil_obj.pkgver()["active package version"]
                )
            )
            self.sit_fw_ver = float(
                "".join(formated_sit_fw_ver[:3])
                + "."
                + str(int("".join(formated_sit_fw_ver[3:5])))
            )
            if (self.sit_fw_ver >= 230.2) or (self.sit_fw_ver >= 231.1):
                install_bcm_sosreport_util(host)
                try:
                    host_exe = host.import_module("controller.lib.common.shell.exe")
                    log.info(f"Generating bcm sos report on {host.name}")
                    host_exe.block_run("bcm_sosreport")
                except Exception as err:
                    log.warning(
                        f"Unable to generate bcm sosreport on {host.name}. Error: {err}"
                    )


def subtest_wrapper(*dec_args):
    def _subtest_wrapper(func):
        @wraps(func)
        def wrapper(self: TestBase, *args, **kwargs):
            subtest_start_time = time.time()
            for node in self._nodes:
                del self.params[node]
            params_copy = copy.deepcopy(self.params)
            self.params = munchify(
                {**self.params, **self._nodes, **subtest_args}, factory=Munchfied
            )

            for node in list(self._nodes.values()):
                node_logging = node.import_module("logging")
                node_logging.info(
                    "#########    {}   started ##########".format(func.__name__.upper())
                )
                try:
                    node_vmm = node.import_module(
                        "virt.lib.common.virtual_machine"
                    ).get_vm_manager()
                    if len(node_vmm.get_vm_list()) > 0:
                        for vm in list(node.vm.values()):
                            vm_logging = vm.import_module("logging")
                            vm_logging.info(
                                "#########    {}   started ##########".format(
                                    func.__name__.upper()
                                )
                            )
                except Exception:
                    pass
            log.info("##################################################")
            log.info(
                "##############    SUBTEST : {}   ##########".format(
                    func.__name__.upper()
                )
            )
            log.info("##################################################")
            iface_speeds_before = None
            old_racadm_vals = {}
            # clearing dmesg
            validation.clear_dmesg_logs(self._nodes.values(), self.init_iface)
            # Skip clear bnxtnvm logs for Preboot
            if self.params.os_platform == "Preboot":
                pass
            else:
                validation.clear_bnxtnvm_logs(self.params.sut, self.params)

            if self.params.pre_post_validations.kmemleaks is True:
                validation.clear_memleaks(self.params.sut)

            if self.init_iface:
                # error recovery config
                if self.params.error_recovery_check is True:
                    validation.check_error_recovery_counter_before_test(
                        self.params.sut, self.params
                    )
                # Fw reset counter
                if self.params.fw_reset_check is True:
                    validation.fw_reset_counter_before_test(
                        self.params.sut, self.params
                    )
                # ping
                if (
                    self.params.pre_post_validations.ping is True
                    and self.params.topology not in ["sut", "client"]
                ):
                    validation.ping_test(self)
                else:
                    log.warning(
                        f"Ping is skipped as required by {func.__name__.upper()}"
                    )
                # speeds
                if self.params.pre_post_validations.speed is True:
                    iface_speeds_before = validation.get_iface_speeds(
                        list(self._nodes.values()), collection_time="before"
                    )
                # stats
                if self.params.pre_post_validations.stats is True:
                    validation.get_nic_old_stats_count(self.params.sut, self.params)
                    validation.print_pause_params_state(self.params.sut, msg="Pre Test")
                # idle check
                if self.params.pre_post_validations.idle_check is True:
                    validation.check_idle_check(list(self._nodes.values()), self.params)
                # health status
                if self.params.pre_post_validations.health_status is True:
                    validation.check_health_status(
                        list(self._nodes.values()), self.params
                    )

                # getresourcecounts
                if self.params.pre_post_validations.get_resource_counts is True:
                    validation.getresource_counts(
                        list(self._nodes.values()), self.params
                    )

                if self.params.pre_post_validations.racadm_attrs is True:
                    old_racadm_vals = validation.get_racadm_attrs(self.params.sut)
            # Call to subtest
            log.info(
                "\n#############################################################\n"
                "########## START SUBTEST (PRE-VALIDATION COMPLETE) ##########\n"
                "#############################################################"
            )
            for node in list(self._nodes.values()):
                node_logging = node.import_module("logging")
                node_logging.info(
                    "#########    START {} (PRE-VALIDATION COMPLETE)   ##########".format(
                        func.__name__.upper()
                    )
                )

            self.subtest_results[func.__name__] = (
                "Fail"  # default in case of exception running subtest
            )
            subtest_result = func(self, *args, **kwargs)
            GlobalVars.result_code = "Pass" if subtest_result else "Fail"

            log.info(
                "\n##############################################################\n"
                "########## SUBTEST COMPLETE (START POST-VALIDATION) ##########\n"
                "##############################################################"
            )
            for node in list(self._nodes.values()):
                node_logging = node.import_module("logging")
                node_logging.info(
                    "#########    {} COMPLETE (START POST-VALIDATION)   ##########".format(
                        func.__name__.upper()
                    )
                )
                try:
                    node_vmm = node.import_module(
                        "virt.lib.common.virtual_machine"
                    ).get_vm_manager()
                    if len(node_vmm.get_vm_list()) > 0:
                        for vm in list(node.vm.values()):
                            vm_logging = vm.import_module("logging")
                            vm_logging.info(
                                "#########    {}  COMPLETE ##########".format(
                                    func.__name__.upper()
                                )
                            )
                except Exception:
                    pass

            if self.init_iface:
                # generate coredump when subtest gets failed
                self.to_generate_coredump(
                    subtest_result=subtest_result,
                    subtest_name=func.__name__,
                    test_case_details=self.stat_testcase_info,
                )
                # Fw reset counter
                if self.params.fw_reset_check is True:
                    validation.fw_reset_counter_after_test(self.params.sut, self.params)
                # error recovery config
                if self.params.error_recovery_check is True:
                    validation.check_error_recovery_counter_after_test(
                        self.params.sut, self.params
                    )
                # stats
                if self.params.pre_post_validations.stats is True:
                    validation.get_nic_new_stats_count(self.params.sut, self.params)
                    validation.print_pause_params_state(
                        self.params.sut, msg="Post Test"
                    )
                # speeds
                if (
                    self.params.pre_post_validations.speed is True
                    and iface_speeds_before
                ):
                    iface_speeds_after = validation.get_iface_speeds(
                        list(self._nodes.values()), collection_time="after"
                    )
                    validation.compare_iface_speed(
                        iface_speeds_before, iface_speeds_after
                    )
                validation.validate_bnxtnvm_logs(self.params.sut, self.params)
                validation.compare_fw_reset_counter(self.params.sut, self.params)
                validation.compare_error_recovery_counter(self.params.sut, self.params)
                validation.examine_nic_stats_count(self.params.sut, self.params)

                # idle check
                if self.params.pre_post_validations.idle_check is True:
                    validation.check_idle_check(list(self._nodes.values()), self.params)
                # health status
                if self.params.pre_post_validations.health_status is True:
                    validation.check_health_status(
                        list(self._nodes.values()), self.params
                    )

                if (
                    old_racadm_vals
                    and self.params.pre_post_validations.racadm_attrs is True
                ):
                    new_racadm_vals = validation.get_racadm_attrs(self.params.sut)
                    validation.compare_racadm_attrs(
                        self.params.sut, old_racadm_vals, new_racadm_vals, self.params
                    )

            if self.params.pre_post_validations.dmesg is True:
                log.info(
                    f"Starting post-subtest validation of dmesg for {func.__name__.upper()}"
                )
                validation.validate_dmesg(
                    list(self._nodes.values()),
                    params=self.params,
                    chk_for_vmk_dmesg=self.init_iface,
                )
            else:
                log.warning(
                    f"Post-subtest validation of dmesg for {func.__name__.upper()} is skipped per request by "
                    f"the setting of param pre_post_validations.dmesg: "
                    f"{self.params.pre_post_validations.dmesg}"
                )

            if self.params.pre_post_validations.kmemleaks is True:
                validation.check_memleaks(self.params.sut)

            # getresourcecounts
            if self.params.pre_post_validations.get_resource_counts is True:
                validation.getresource_counts(list(self._nodes.values()), self.params)

            log.info(
                "\n######################################################\n"
                "########## SUBTEST POST-VALIDATION COMPLETE ##########\n"
                "######################################################"
            )
            for node in list(self._nodes.values()):
                node_logging = node.import_module("logging")
                node_logging.info(
                    "#########    {} POST-VALIDATION COMPLETE   ##########".format(
                        func.__name__.upper()
                    )
                )

            log.info(f"Config params used for this tc: {self.params.params_used()}")
            log.info(f"Setup topology: {self.params.switch_config}")

            self.params = munchify({**params_copy, **self._nodes}, factory=Munchfied)

            for node in list(self._nodes.values()):
                node_logging = node.import_module("logging")
                node_logging.info(
                    "#########    {}   completed ##########".format(
                        func.__name__.upper()
                    )
                )
            # Abort if subtest is failed
            subtest_result = str(GlobalVars.result_code)
            subtest_total_time = str(time.time() - subtest_start_time)
            self.process_result(func.__name__, subtest_result, subtest_total_time)
            return subtest_result == "Pass"

        return wrapper

    if len(dec_args) == 1 and callable(dec_args[0]):
        subtest_method = dec_args[0]
        subtest_args = {}
        return _subtest_wrapper(subtest_method)
    else:
        subtest_args = dec_args[0] if len(dec_args) == 1 else {}
        return _subtest_wrapper


class GlobalVars:
    """
    This class is for setting and getting the global log_folder and result_code variables
    log_folder: to replace STATConfigClass.SystemVariables['LogFolder']
    result_code: to replace STATConfigClass.resultCode
    """

    _log_folder: Union[str, None] = None
    _result_code: Union[str, None] = None  # 'Pass'|'Fail'|'Abort'

    @property
    def log_folder(self) -> Union[str, None]:
        return self._log_folder

    @property
    def result_code(self) -> Union[str, None]:
        return self._result_code

    @log_folder.setter
    def log_folder(self, log_folder: str):
        self._log_folder = log_folder

    @result_code.setter
    def result_code(self, result_code: str):
        if result_code not in ["Pass", "Fail", "Abort"]:
            raise Exception(
                f"Error: invalid value for result_code: {result_code}. "
                f"Expected values: 'Pass', 'Fail', 'Abort'"
            )
        self._result_code = result_code
