import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { updateA } from './actions.js'
import { updateF } from './feedbacks.js'
import { updateV } from './variables.js'
import { TCPConnection, RemoteDevice, RemoteControlClasses, Types } from 'aes70'
class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		this.info = {}
		this.muteObj = []
		this.muteState = [true, true, true, true]
		this.powerState = true
		this.powerObj = {}
		this.ready = false
		this.updateActions(InstanceStatus.Connecting)
		this.updateVariableDefinitions()
		this.log('info', 'Aes70 Device Connection')
		this.connect()
	}

	connect() {
		TCPConnection.connect({
			host: this.config.host,
			port: this.config.port,
		})
			.then((con) => {
				this.aescon = con
				this.remoteDevice = new RemoteDevice(con)
				this.remoteDevice.set_keepalive_interval(1)
				this.remoteDevice.on("close", (args)=> {
					this.log('warn', 'Aes70 Device Connection closed!')
					this.ready = false
					this.log('warn', 'Aes70 Device Connection Error try reconnect in 10 Seconds!')
					setTimeout(() => {
						this.updateStatus(InstanceStatus.ConnectionFailure)
						this.connect()
					}, 10000)
				})

				this.remoteDevice.on("error", (args)=> {
					this.log('error', JSON.stringify(args))
				})
				this.updateStatus(InstanceStatus.Ok)
				this.updateActions() // export actions
				this.updateFeedbacks() // export feedbacks
				this.remoteDevice.DeviceManager.GetModelDescription().then((value)=> {
					this.info["type"] = value.Name
					this.info["version"] = value.Version
					this.remoteDevice.DeviceManager.GetDeviceName().then((name) => {
						this.info["name"] = name
					}).then(()=>{
						this.setVariableValues({'amp_type': this.info.type,'amp_name': this.info.name, 'amp_firmware': this.info.version})
					});
				})
				this.remoteDevice.get_role_map().then((map) => {
					if (map.get('Settings_Box/Settings_PwrOn')) {
						this.powerObj = map.get('Settings_Box/Settings_PwrOn')
						this.powerObj.GetPosition().then((v) => {
							if (v.item(0) == 0) {
								this.setAmpPower(true)
							} else {
								this.setAmpPower(false)
							}
							this.checkFeedbacks('PowerState')
						})
						this.powerObj.OnPositionChanged.subscribe((val) => {
							if (val == 0) {
								this.setAmpPower(true)
							} else {
								this.setAmpPower(false)
							}
							this.checkFeedbacks('PowerState')
						})
					}
				})
				this.remoteDevice.get_device_tree().then((tree) => {
					var i = 0
					tree.forEach((treeobj) => {
						if (Array.isArray(treeobj)) {
							treeobj.forEach((obj) => {
								obj.GetClassIdentification().then((cls) => {
									if (cls.ClassID === RemoteControlClasses.OcaMute.ClassID) {
										this.muteObj.push(obj)
										if (i === 3) {
											this.ready = true
											this.muteObj.forEach((v, index) => {
												v.GetState().then((v) => {
													if (v === Types.OcaMuteState.Muted) {
														this.setAmpMute(index, true)
													} else {
														this.setAmpMute(index, false)
													}
													this.checkFeedbacks('ChannelState')
												})
												v.OnStateChanged.subscribe((val) => {
													if (val == 1) {
														this.setAmpMute(index, true)
													} else {
														this.setAmpMute(index, true)
													}
													this.checkFeedbacks('ChannelState')
												})
											})
										}
										i++
									}
								})
							})
						}
					})
				})
			})
			.catch((e) => {
				this.ready = false
				this.log('warn', 'Aes70 Device Connection Error try reconnect in 10 Seconds!')
				setTimeout(() => {
					this.connect()
					this.updateStatus(InstanceStatus.ConnectionFailure)
				}, 10000)
			})
	}

	// When module gets deleted
	async destroy() {
		if (this.aescon) {
			this.muteObj = []
			this.aescon.close()
		}
		this.updateStatus(InstanceStatus.Disconnected)
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config

		if (this.aescon) {
			this.muteObj = []
			this.aescon.close()
			this.updateStatus(InstanceStatus.Connecting)
			this.connect()
		}
	}

	setAmpPower(power) {
		this.powerState = power;
		this.checkFeedbacks('PowerState')
		this.setVariableValues({'amp_power': this.powerState})
	}

	setAmpMute(index, mute) {
		this.muteState[index] = mute;
		this.checkFeedbacks('ChannelState')
		let varindex = `amp_mute_${index}`;
		this.setVariableValues({[varindex]: mute})
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: Regex.IP,
				default: '168.178.10.110',
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: Regex.PORT,
				default: 50014,
			},
		]
	}

	updateActions() {
		updateA(this)
	}

	updateFeedbacks() {
		updateF(this)
	}

	updateVariableDefinitions() {
		updateV(this)
	}
}

runEntrypoint(ModuleInstance, [])
