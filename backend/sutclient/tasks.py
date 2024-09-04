# import os
# import re

# # from celery import shared_task
# import yaml
# from django.conf import settings
# from django.db import IntegrityError, transaction
# from django.shortcuts import get_object_or_404
# from django.utils import timezone

# # from django_cron import CronJobBase, Schedule
# from models import Config


# # @shared_task
# def save_config_to_venv(config_id):
#     # Get the VirtualEnvironment object
#     config_obj = Config.objects.get(id=config_id)

#     # Get the associated Config object
#     # config = config_obj.config_file

#     if config_obj:  # Ensure there is a config object associated
#         # Serialize the Config object to a dictionary
#         config_dict = {
#             "nickname": config_obj.nickname,
#             "backup_restore_config_files": config_obj.backup_restore_config_files,
#             "validate_config_params": config_obj.validate_config_params,
#             "os_platform": config_obj.os_platform,
#             "rpyc_port": config_obj.rpyc_port,
#             "topology": config_obj.topology,
#             "card_type": config_obj.card_type,
#             "switch_config": config_obj.switch_config_obj.id,  # or config_obj.switch_config_obj.name if you want the name
#             "sut": config_obj.sut.id,
#             "client": config_obj.client.id,
#             "client_2": config_obj.client_2.id,
#             "rmii_interface": config_obj.rmii_interface.id,
#             "fw_version": list(config_obj.fw_version.values_list("id", flat=True)),
#             "fw_upgrade_types": list(
#                 config_obj.fw_upgrade_types.values_list("id", flat=True)
#             ),
#             "sit": config_obj.sit.id,
#             "spl_pkg_file_path": config_obj.spl_pkg_file_path.id,
#             "load_roce_driver": config_obj.load_roce_driver,
#             "inbox_driver": config_obj.inbox_driver,
#             "driver_name": config_obj.driver_name,
#             "client_sit": config_obj.client_sit.id,
#             "repave": config_obj.repave,
#             "mtu_list": config_obj.mtu_list,
#             "vlan_id_list": config_obj.vlan_id_list,
#             "vm_os": config_obj.vm_os,
#             "vfs_per_pf": config_obj.vfs_per_pf,
#             "vnic_per_vm": config_obj.vnic_per_vm,
#             "number_of_vms_to_test": config_obj.number_of_vms_to_test,
#             "errors_to_flag": config_obj.errors_to_flag,
#             "fw_reset_check": config_obj.fw_reset_check,
#             "error_recovery_check": config_obj.error_recovery_check,
#             "cleanup_on_failure": config_obj.cleanup_on_failure,
#         }

#         # Convert the dictionary to YAML format
#         yaml_content = yaml.dump(config_dict)

#         # Determine the destination path in the virtual environment directory
#         # venv_directory = os.path.join(settings.MEDIA_ROOT, "venvs", venv.venv_name)
#         # os.makedirs(
#         #     venv_directory, exist_ok=True
#         # )  # Create the directory if it doesn't exist

#         yaml_file_path = os.path.join(settings.MEDIA_ROOT, "config_obj.yaml")

#         # Save the YAML content to the destination path
#         with open(yaml_file_path, "w") as yaml_file:
#             yaml_file.write(yaml_content)

#         print(f"Config file saved to {yaml_file_path}")

#     else:
#         print("No config object associated with this virtual environment.")
