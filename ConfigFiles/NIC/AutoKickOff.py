import os.path
import shutil
import time
import logging.handlers
import sys
import ssl
import yaml
import controller.lib.common.shell.exe as exe
from pathlib import Path
import xml.etree.ElementTree as ET
import traceback
from bs4 import BeautifulSoup
import urllib.request
import configparser
import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

config = configparser.ConfigParser()
logging.root.setLevel(logging.DEBUG)
log = logging.getLogger(__name__)
console = logging.StreamHandler()
console.setLevel(logging.WARNING if '-d' in sys.argv else logging.DEBUG)
logging.root.addHandler(console)
logfile_handler = logging.handlers.RotatingFileHandler(filename=Path(os.getcwd(), 'auto_kickoff.log'),
                                                       maxBytes=25000000, backupCount=9)
if logfile_handler:
    logfile_handler.setFormatter(
        logging.Formatter('%(asctime)s|%(levelname)-8s|%(message)s'))
    logging.root.addHandler(logfile_handler)


def get_file_name(dir_path):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    links = []
    try:
        urlpath = urllib.request.urlopen(dir_path, context=ctx, timeout=30)
        soup = BeautifulSoup(urlpath, "html.parser")
        for link in soup.findAll('a'):
            if "zip" not in link.get('href') and "." in link.get('href') and \
                    "donotuse" not in str(link.get('href')).lower():
                links.append(link.get('href').replace("/", ""))
    except:
        raise Exception(f'Cannot find {dir_path}')
    return links


def update_sit_versions_N(config, sit1,version=None,stream=None):
    sit = {"release_version": version,  # release version that to be used for driver/fw/bnxtnvm etc installation
           "release_stream": stream,  # release stream of the release_version
           "release_old_version": config['SITS'][sit1]['SIT_VERSIONS']["old_version"],  # old release version for downgrade and upgrade tests
           "release_old_stream": config['SITS'][sit1]['SIT_VERSIONS']["stream"]} # release stream of the release_old_version
    client_sit = {"release_version": version,  # release version that to be used for driver/fw/bnxtnvm etc installation
                  "release_stream": stream}  # release stream of the release_version
    return [sit, client_sit]


def update_config_file(config_file_path, config, sit1,N_1=None):
    if N_1 ==None:
        [sit, client] = update_sit_versions_N(config, sit1, config['SITS'][sit1]['SIT_VERSIONS']["current_version"], config['SITS'][sit1]['SIT_VERSIONS']["stream"])
    elif N_1 == 2:
        [sit, client] = update_sit_versions_N(config, sit1,config['SITS'][sit1]['SIT_VERSIONS']["N_2"],config['SITS'][sit1]['SIT_VERSIONS']["stream_2"])
    else:
        [sit, client] = update_sit_versions_N(config, sit1,config['SITS'][sit1]['SIT_VERSIONS']["N_1"],config['SITS'][sit1]['SIT_VERSIONS']["stream_1"])
    init_path = config_file_path
    with open(init_path, 'r') as yamlfile:
        list_param = yaml.safe_load(yamlfile)
    list_param["sit"].update(sit)
    list_param["client_sit"].update(client)
    with open(init_path, 'w') as yamlfile:
        yaml.dump(list_param, yamlfile, sort_keys=False)


def update_fw_version(config_file_path, config, sit1):
    init_path = config_file_path
    with open(init_path, 'r') as yamlfile:
        list_param = yaml.safe_load(yamlfile)
    print(list_param["fw_version"])
    if list_param["fw_version"][-1][0] != config['SITS'][sit1]['SIT_VERSIONS']["stream"]:
        log.debug("updating both release stream and sit version in fw_version list to up to date")
        list_param["fw_version"].append([config['SITS'][sit1]['SIT_VERSIONS']["stream"], config['SITS'][sit1]['SIT_VERSIONS']["current_version"]])
    elif list_param["fw_version"][-1][0] == config['SITS'][sit1]['SIT_VERSIONS']["stream"] and list_param["fw_version"][-1][1] != config['SITS'][sit1]['SIT_VERSIONS']["current_version"]:
        log.debug("updating only sit version in fw_version list as stream is up to date")
        list_param["fw_version"][-1][1] = config['SITS'][sit1]['SIT_VERSIONS']["current_version"]
    else:
        log.debug("Firmware version list up to date")
    log.debug(list_param["fw_version"])
    with open(init_path, 'w') as yamlfile:
        yaml.dump(list_param, yamlfile, sort_keys=False)


def copy_config_file(source_path, destination_path):
    shutil.copy2(source_path, destination_path)


def rename_test_suite_xml_file_name(xml_file, f_name):
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        edited = False
        for element in root:
            if element.tag == "TestPlan":
                print(str(f_name))
                element.attrib["TestPlanName"] = str(f_name)
                edited = True
                break
        if edited:
            log.info("XML file edited...")
        else:
            log.warning("Failed to edit XML file....")
        tree.write(xml_file)
    except Exception:
        log.error(traceback.format_exc())


def run_execution(config, xml_file, test_suite_file):
    log.info("Initiating the Sanity tests.")
    try:
        rename_test_suite_xml_file_name(xml_file, test_suite_file)
        exe.block_run("{} /configfile {} /logfolder C:/pt_bst {}".format(
            Path(config['STAT']["stat_cli_path"] + '/stat_cli.exe'), xml_file,
            '/run close'), cwd=config['STAT']["stat_cli_path"], shell=True)
        return True
    except Exception:
        log.error(traceback.format_exc())
        # AMITABH
        # config['wait']['wait_on_failure'] = True
        # log.info("Updating the wait_on_failure to True make it False to continue")
        return False

def send_email(config, reminder):
    log.info("Sending an email for updating Wait on failure")
    suite_name = config["TEST_SUITES"]["test_suite_file_path"][0].split("\\")[-1]
    subject = f'{suite_name} is stopped due to Wait on Failure is set to true - Reminder {reminder}'
    msg = MIMEMultipart()
    msg['From'] = config["email_options"]["user_email"]
    email_user = config["email_options"]["user_email"]
    email_send = []
    email_send.append(config["email_options"]["user_email"])
    for email in config["email_options"]["recepient_list"]:
        email_send.append(email)
    # converting list of recipients into comma separated string
    msg['To'] = ", ".join(email_send)
    msg['Subject'] = subject
    text = msg.as_string()
    server = smtplib.SMTP('mailhost.broadcom.net')
    server.sendmail(email_user, email_send, text)
    server.quit()

if __name__ == '__main__':
    reminder = 0
    while True:
        try:
            with open('config.yml', 'r') as yamlfile:
                config = yaml.safe_load(yamlfile)
            for sit1 in config["SITS"].keys():
                release_old_stream = config['SITS'][sit1]['SIT_VERSIONS']["stream"]
                release_path = 'http://eca-ccxsw.lvn.broadcom.net/releases/nxe/SIT/'
                dir_path = '{}/{}'.format(release_path, release_old_stream)
                controller_path = Path(config['STAT']["stat_cli_path"] + config['CTRL']["ctrl_path"])
                version_list = get_file_name(dir_path)
                log.info(version_list)
                current_version = version_list[-1]
                if not config['wait']['wait_on_failure']:
                    config['SITS'][sit1]['SIT_VERSIONS']['current_version'] = current_version
                    with open('config.yml', 'w') as yamlfile:
                        yaml.dump(config, yamlfile, sort_keys=False)
                    if current_version != config['SITS'][sit1]['SIT_VERSIONS']["old_version"]:
                        log.info("New version ({}) has been released. Starting the tests....".format(current_version))
                        test_suite_py_paths = []
                        test_suite_paths = []

                        for test_suite_py in config['TEST_SUITES']["test_suite_file_path"]:
                            test_suite_py_paths.append(Path(config['STAT']["stat_cli_path"] + test_suite_py))
                            log.info(f"DEBUG : Config Stat : {config['STAT']['stat_cli_path']} + test_suite_py : {test_suite_py}")
                        
                        log.info(f"DEBUG 2 : test_suite_py_paths : {test_suite_py_paths}")
                        for test_suite_py_path in test_suite_py_paths:
                            stat_python = Path(config['STAT']["stat_cli_path"] + config['PYTHON_PATH']["stat_py_path"])
                            log.info(f"The test suite will be generated first....: {test_suite_py_path}")
                            exe.block_run('{} {} {}'.format(stat_python, test_suite_py_path, config['STAT']["stat_cli_path"]),
                                          cwd=Path(os.path.dirname(test_suite_py_path)))

                        for test_suite, test_suite_py_path in zip(config['TEST_SUITES']["test_suite_file_name"], test_suite_py_paths):
                            src_filename = Path(os.path.dirname(test_suite_py_path) + "\\" + test_suite)
                            dest_filename = Path(os.path.dirname(test_suite_py_path) + "\\" + "PT_BST-SIT_" + current_version + "_" + test_suite)

                            if not Path(dest_filename).is_file():
                                os.rename(src_filename, dest_filename)
                            test_suite_paths.append(dest_filename)
                        log.info(test_suite_py_paths)
                        log.info(test_suite_paths)

                        no_of_suites = len(test_suite_paths)
                        no_of_configs = len(config['SUT_CLIENT_CONFIG']["config_file_path"])
                        no_of_test_configs = len(config['TEST_CONFIG']["test_config_file_path"])
                        if no_of_configs !=  no_of_test_configs:
                            raise Exception("Number of sut_client_config.yml files not matching with test_config files")
                        if no_of_suites == 1 and no_of_suites < no_of_configs:
                            # this is 1 test suite will get executed on all config file provided
                            test_suite_paths = test_suite_paths * no_of_configs
                        elif no_of_suites > 1 and no_of_suites != no_of_configs:
                            raise Exception("Provided test suites are not matching with provided config file. "
                                            "Please provide config files as many of suites")

                        log.debug(test_suite_paths)
                        log.info(config['SUT_CLIENT_CONFIG']["config_file_path"])
                        for test_suite_file, config_file, test_config_file in zip(test_suite_paths, config['SUT_CLIENT_CONFIG']["config_file_path"], config['TEST_CONFIG']["test_config_file_path"]):
                            # log.info("L2 basic")
                            log.info("##################################")
                            log.info(test_suite_file)
                            log.info(config_file)
                            log.info(test_config_file)
                            log.info("##################################")

                            # for config_file in config['SUT_CLIENT_CONFIG']["config_file_path"]
                            if "N_1" in str(test_suite_file):
                                log.info("Updating the config file with N-1 sit versions.")
                                update_config_file(config_file, config, sit1, N_1=True)
                            elif "N_2" in str(test_suite_file):
                                log.info("Updating the config file with N-2 sit versions.")
                                update_config_file(config_file, config, sit1, N_1=2)
                            else:
                                log.info("Updating the config file with sit versions.")
                                update_config_file(config_file, config, sit1)
                                update_fw_version(config_file, config, sit1)

                            log.info("copying config file into the controller package.")
                            sut_client_conf_file_path = config['STAT']["stat_cli_path"] + config['SUT_CLIENT_CONFIG']["config_path"]
                            test_config_file_path = config['STAT']["stat_cli_path"] + config['TEST_CONFIG']["test_config_path"]

                            config_path = Path(config['STAT']["stat_cli_path"] + config['SUT_CLIENT_CONFIG']["config_path"])
                            test_config_path = Path(config['STAT']["stat_cli_path"] + config['TEST_CONFIG']["test_config_path"])
                            # Copying sut_client_config file to controller/test_script/config path
                            copy_config_file(config_file, config_path)

                            # Copying __test_config__.yml file to controller/test_config/os_namae path
                            copy_config_file(test_config_file, test_config_path)

                            # If provided sut_client_config.yml name other than "sut_client_config.yml"
                            file_name = config_file.split('\\')[-1]
                            if file_name != "sut_client_config.yml":
                                source_file_name = sut_client_conf_file_path+file_name
                                dest_file_name = sut_client_conf_file_path+"sut_client_config.yml"
                                os.remove(dest_file_name)
                                os.rename(source_file_name, dest_file_name)

                            # If provided __test_config__.yml name other than "__test_config__.yml" like __test_config__1.yml
                            file_name = test_config_file.split('\\')[-1]
                            if file_name != "__test_config__.yml":
                                source_file_name = test_config_file_path + file_name
                                dest_file_name = test_config_file_path + "__test_config__.yml"
                                os.remove(dest_file_name)
                                os.rename(source_file_name, dest_file_name)

                            xml_file = config['STAT']["xml_file_paths"]
                            result = run_execution(config, xml_file, test_suite_file)

                            # Will not proceed with any other test suite if sit_update test suite fails
                            if "sit_update" in str(test_suite_file) and not result:
                                log.info("SIT update test suite failed hence Skipping further test suite execution")
                                break

                            # If Any Failure occured during any test suite execution stopping the run there itself.
                            if not config['wait']["continue_on_test_suite_failure"]:
                                if not result:
                                    break
                    log.info("Updating the old_version param in the yml file before exiting.")
                    config['SITS'][sit1]['SIT_VERSIONS']['old_version'] = current_version
                    with open('config.yml', 'w') as yamlfile:
                        yaml.dump(config, yamlfile, sort_keys=False)
                    time.sleep(5)
                else:
                    reminder += 1
                    send_email(config, reminder)
            wait_time = (config['wait']['days'] * 3600 * 24) + (config['wait']['time'] * 60)
            log.info("Waiting for %d days and %d min/s to check the SIT repo for new build." % (config['wait']['days'], int(config['wait']['time'])))
            time.sleep(wait_time)
        except Exception:
            log.error(traceback.format_exc())
            break
