export async function updateV(self) {
    self.setVariableDefinitions([
        { variableId: 'amp_type', name: 'Amp Type' },
        { variableId: 'amp_name', name: 'Amp Name' },
        { variableId: 'amp_firmware', name: 'Amp Firmware' },
        { variableId: 'amp_power', name: 'Amp Power' },
        { variableId: 'amp_power_hours', name: 'Amp Power Hours'},
        { variableId: 'amp_mute_0', name: 'Amp Mute Ch1' },
        { variableId: 'amp_mute_1', name: 'Amp Mute Ch2' },
        { variableId: 'amp_mute_2', name: 'Amp Mute Ch3' },
        { variableId: 'amp_mute_3', name: 'Amp Mute Ch4' },
        ])
}