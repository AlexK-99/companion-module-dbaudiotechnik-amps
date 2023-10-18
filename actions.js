import { Types } from 'aes70'

export function updateA(self) {
	self.setActionDefinitions({
		power_action: {
			name: 'Change Power State',
			options: [
				{
					id: 'power',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 1, label: 'On' },
						{ id: 0, label: 'Off' },
						{ id: -1, label: 'Toggel' },
					],
					default: 0,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					switch (event.options.power) {
						case 0:
							self.powerObj
								.SetPosition(0)
								.then(() => {
									self.log('info', 'Amp Power Off!')
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
							break
						case 1:
							self.powerObj
								.SetPosition(1)
								.then(() => {
									self.log('info', 'Amp Power On!')
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
							break
						case -1:
							self.powerObj
								.GetPosition()
								.then((v) => {
									switch (v.item(0)) {
										case 0:
											self.powerObj
												.SetPosition(1)
												.then(() => {
													self.log('info', 'Amp Power On!')
												})
												.catch((err) => {
													self.log('error', err.toString())
												})
											break
										case 1:
											self.powerObj
												.SetPosition(0)
												.then(() => {
													self.log('info', 'Amp Power Off!')
												})
												.catch((err) => {
													self.log('error', err.toString())
												})
											break
									}
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
							break
					}
				}
			},
		},
		mute_action: {
			name: 'Mute Amp Channel',
			options: [
				{
					id: 'mute',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
						{ id: -1, label: 'All' },
					],
					default: 0,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					if (event.options.mute === -1) {
						self.muteObj.forEach((obj) => {
							obj
								.SetState(Types.OcaMuteState.Muted)
								.then(() => {
									self.log('info', 'Mute Ch: ' + numberToChar(event.options.mute))
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
						})
					} else {
						self.muteObj[event.options.mute]
							.SetState(Types.OcaMuteState.Muted)
							.then(() => {
								self.log('info', 'Mute Ch: ' + numberToChar(event.options.mute))
							})
							.catch((err) => {
								self.log('error', err.toString())
							})
					}
				}
			},
		},
		unmute_action: {
			name: 'Unmute Amp Channel',
			options: [
				{
					id: 'unmute',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
						{ id: -1, label: 'All' },
					],
					default: 0,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					if (event.options.unmute === -1) {
						self.muteObj.forEach((obj) => {
							obj
								.SetState(Types.OcaMuteState.Unmuted)
								.then(() => {
									self.log('info', 'Unmute Ch: ' + numberToChar(event.options.unmute))
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
						})
					} else {
						self.muteObj[event.options.unmute]
							.SetState(Types.OcaMuteState.Unmuted)
							.then(() => {
								self.log('info', 'Unmute Ch: ' + numberToChar(event.options.unmute))
							})
							.catch((err) => {
								self.log('error', err.toString())
							})
					}
				}
			},
		},
		toggelmute_action: {
			name: 'Toggel Amp Channel',
			options: [
				{
					id: 'toggelmute',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
						{ id: -1, label: 'All' },
					],
					default: 0,
				},
			],
			callback: async (event) => {
				if (self.ready) {
					if (event.options.toggelmute === -1) {
						self.muteObj.forEach((obj, index) => {
							obj
								.GetState()
								.then((v) => {
									if (v === Types.OcaMuteState.Muted) {
										obj
											.SetState(Types.OcaMuteState.Unmuted)
											.then(() => {
												self.log('info', 'Unmute Ch: ' + numberToChar(index))
											})
											.catch((err) => {
												self.log('error', err.toString())
											})
									} else {
										obj
											.SetState(Types.OcaMuteState.Muted)
											.then(() => {
												self.log('info', 'Mute Ch: ' + numberToChar(index))
											})
											.catch((err) => {
												self.log('error', err.toString())
											})
									}
								})
								.catch((err) => {
									self.log('error', err.toString())
								})
						})
					} else {
						self.muteObj[event.options.toggelmute]
							.GetState()
							.then((v) => {
								if (v === Types.OcaMuteState.Muted) {
									self.muteObj[event.options.toggelmute]
										.SetState(Types.OcaMuteState.Unmuted)
										.then(() => {
											self.log('info', 'Unmute Ch: ' + numberToChar(event.options.toggelmute))
										})
										.catch((err) => {
											self.log('error', err.toString())
										})
								} else {
									self.muteObj[event.options.toggelmute]
										.SetState(Types.OcaMuteState.Muted)
										.then(() => {
											self.log('info', 'Mute Ch: ' + numberToChar(event.options.toggelmute))
										})
										.catch((err) => {
											self.log('error', err.toString())
										})
								}
							})
							.catch((err) => {
								self.log('error', err.toString())
							})
					}
				}
			},
		},
	})
}

function numberToChar(num) {
	switch (num) {
		case 0:
			return 'A'
		case 1:
			return 'B'
		case 2:
			return 'C'
		case 3:
			return 'D'
		case -1:
			return 'All'
	}
}
