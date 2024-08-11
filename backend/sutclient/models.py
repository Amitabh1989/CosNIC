from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.


class Switches(models.Model):
    switch_ip = models.GenericIPAddressField()
    switch_username = models.CharField(max_length=100)
    switch_password = models.CharField(max_length=100)
    bond_modes = ArrayField(models.IntegerField())
    portchannel_no = ArrayField(models.IntegerField())


class SwitchConfig(models.Model):
    switch_topology = models.BooleanField(default=False)
    switch_ip = models.GenericIPAddressField()
    switch_username = models.CharField(max_length=100, default="admin")
    switch_password = models.CharField(max_length=100, blank=True, default="admin")
    bond_modes = ArrayField(models.IntegerField())
    portchannel_no = ArrayField(models.IntegerField())
    switches = models.ManyToManyField(Switches)


class Interface(models.Model):
    mac_addr = models.CharField(max_length=25)
    mtu = models.IntegerField(default=1500)
    switchport_num = models.CharField(max_length=100)
    driver = models.CharField(max_length=100, default="bnxt_en")
    roce_driver = models.CharField(max_length=100, default="bnxt_re")
    switch_details = models.ForeignKey(SwitchConfig, on_delete=models.CASCADE)
    pci_slot_gen = models.IntegerField(default=3)
    total_phy_ports_on_adapter = models.IntegerField(default=2)


class Ipmi(models.Model):
    nickname = models.CharField(max_length=100)
    ipmi_host = models.CharField(max_length=100)
    ip_addr = models.GenericIPAddressField()
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)


class Sut(models.Model):
    nickname = models.CharField(max_length=100)
    mgmt_ip_addr = models.GenericIPAddressField()
    name = models.CharField(max_length=100)
    ipmi = models.ForeignKey(Ipmi)
    iface_list = models.ManyToManyField(Interface)


class Client(models.Model):
    mgmt_ip_addr = models.GenericIPAddressField()
    name = models.CharField(max_length=100)
    iface_list = models.ManyToManyField(Interface)


class Sit(models.Model):
    release_version = models.CharField(max_length=100)
    release_stream = models.CharField(max_length=100)
    release_path = models.URLField(
        default="http://eca-ccxsw.lvn.broadcom.net/releases/nxe/SIT/"
    )
    driver_dir = models.CharField(max_length=200, default="Linux_Driver/")
    restructured_driver_dir = models.CharField(
        max_length=200, default="drivers_linux/bnxt_en/"
    )
    driver_format = models.CharField(max_length=100, default="bnxt_en-.*.tar.gz")
    restructured_sit_ver = ArrayField(models.CharField(max_length=100))
    thor2_crid = models.CharField(max_length=100, default="CRID_0001")


class Dup(models.Model):
    dup_prg_path = models.CharField(
        max_length=100,
        default="/home/nic/Network_Firmware_0MRR3_LN64_22.71.11.13_jho227x06.BIN",
    )
    prg_path_prev = models.CharField(
        max_length=150,
        default="/home/nic/Network_Firmware_0MRR3_LN64_22.61.10.70_CavX11.BIN",
    )
    prg_path_prev2 = models.CharField(
        max_length=150,
        default="/home/nic/Network_Firmware_0MRR3_LN64_22.71.11.13_jho227x06.BIN",
    )
    supported_macs = ArrayField(models.CharField(max_length=100), default=list)


class ClientSit(models.Model):
    release_version = models.CharField(max_length=100)
    release_stream = models.CharField(max_length=100)
    release_path = models.URLField(
        default="http://eca-ccxsw.lvn.broadcom.net/releases/nxe/SIT/"
    )
    thor2_crid = models.CharField(max_length=100, default="CRID_0001")


class FwVersion(models.Model):
    version = ArrayField(models.CharField(max_length=100))


class FwUpgradeType(models.Model):
    upgrade_type = ArrayField(
        models.CharField(max_length=100), default=["repave", "upgrade", "downgrade"]
    )


class Rmii(models.Model):
    rmii_interface = models.CharField(max_length=30, default="00:0a:f7:b8:b5:75")
    instance_id = models.IntegerField(max_length=100)
    auto_increment = models.CharField(max_length=100, default="\x01")
    bmc_interface = models.CharField(max_length=30, default="00:62:0b:1a:28:31")


class CDCheckout(models.Model):
    board_pkg_dir_old = models.CharField(
        max_length=100, default="/root/fw_dup_withcfg_old/NXE/lx/l64"
    )
    board_pkg_file_name_old = models.CharField(
        max_length=100, default="/root/fw_dup_withcfg_old/NXE/lx/l64/Th57414_2x25.pkg"
    )
    board_pkg_dir = models.CharField(
        max_length=100, default="/root/fw_dup_withcfg/NXE/lx/l64/"
    )
    board_pkg_file_name = models.CharField(
        max_length=100, default="/root/fw_dup_withcfg/NXE/lx/l64/Th57414_2x25.pkg"
    )
    bnxt_en_rpm_path = models.CharField(
        max_length=100,
        default="/root/kmod-bnxt_en-1.10.0-215.0.154.0.rhel7u6.x86_64.rpm",
    )
    bnxt_en_rpm_path_old = models.CharField(
        max_length=100,
        default="/root/kmod-bnxt_en-1.10.0-215.0.131.0.rhel7u6.x86_64.rpm",
    )
    bnxt_re_rpm_path = models.CharField(
        max_length=100, default="/root/libbnxt_re-215.0.153.0-rhel7u6.x86_64.rpm"
    )


class SPLPkgFilePath(models.Model):
    spl_pkg_file_path = ArrayField(
        models.CharField(max_length=100), default=list
    )  # Using list as the default factory to prevent shared lists


class Npar(models.Model):
    npar_functions = ArrayField(models.IntegerField(), default=list)
    num_vfs = models.IntegerField(default=4)


class PrePostValidation(models.Model):
    speed = models.BooleanField(default=False)  # false
    dmesg = models.BooleanField(default=False)
    ping = models.BooleanField(default=False)
    stats = models.BooleanField(default=False)
    generate_coredump = models.BooleanField(default=False)
    decode_coredump = models.BooleanField(default=False)
    coredump_on_client = models.BooleanField(default=False)
    idle_check = models.BooleanField(default=False)
    health_status = models.BooleanField(default=False)
    racadm_attrs = models.BooleanField(default=False)
    kmemleaks = models.BooleanField(default=False)
    nvm_restore = models.BooleanField(default=False)
    generate_bcm_sosreport = models.BooleanField(default=False)


class Config(models.Model):
    nickname = models.CharField(max_length=100)
    backup_restore_config_files = models.BooleanField(default=False)
    validate_config_params = models.BooleanField(default=False)
    os_platform = models.CharField(max_length=100)
    rpyc_port = models.IntegerField(default=2726)
    topology = models.CharField(max_length=100, default="sut-client")
    card_type = models.CharField(max_length=100, default="SR")
    switch_config = models.ForeignKey(SwitchConfig, on_delete=models.CASCADE)
    sut = models.ForeignKey(Sut, on_delete=models.CASCADE)
    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name="client_1"
    )
    client_2 = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name="client_2"
    )
    rmii_interface = models.CharField(max_length=100)
    instance_id = models.IntegerField()
    auto_increment = models.CharField(max_length=100)
    bmc_interface = models.CharField(max_length=100)
    fw_version = models.ManyToManyField(FwVersion)
    fw_upgrade_types = models.ManyToManyField(FwUpgradeType)
    sit = models.ForeignKey(Sit, on_delete=models.CASCADE)
    spl_pkg_file_path = models.ForeignKey(SPLPkgFilePath, on_delete=models.CASCADE)
    load_roce_driver = models.BooleanField(default=False)
    inbox_driver = models.BooleanField(default=False)
    driver_name = models.CharField(max_length=100, default="bnxtnd")
    client_sit = models.ForeignKey(
        ClientSit, on_delete=models.CASCADE, related_name="client_sit"
    )
    repave = models.BooleanField(default=False)
    mtu_list = ArrayField(models.IntegerField(), default=list)
    vlan_id_list = ArrayField(models.IntegerField(), default=list)
    vm_os = models.CharField(max_length=100, default="rhel86_legacy")
    vfs_per_pf = models.IntegerField(default=8)
    vnic_per_vm = models.IntegerField(default=8)
    number_of_vms_to_test = models.IntegerField(default=3)
    errors_to_flag = ArrayField(models.CharField(max_length=100), default=list)
    fw_reset_check = models.BooleanField(default=True)
    error_recovery_check = models.BooleanField(default=True)
    cleanup_on_failure = models.BooleanField(default=True)

    # Add other fields as needed
