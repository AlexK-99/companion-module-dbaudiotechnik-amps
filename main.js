import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import {updateA} from './actions.js'
import {updateF} from './feedbacks.js'
import { TCPConnection, RemoteDevice, RemoteControlClasses, Types } from 'aes70';
import  { Arguments } from 'aes70/src/controller/arguments.js'
class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		this.muteObj = []
		this.muteState = [true,true,true,true]
		this.powerState = true;
		this.powerObj = {}
		this.ready = false;
		this.updateActions(InstanceStatus.OK)
		this.log("info", "Aes70 Device Connection")
		this.connect()
	}

	 connect() {
		TCPConnection.connect({
			host: this.config.host,
			port: this.config.port,
		}).then((con) => {
			this.aescon = con;
			this.remoteDevice = new RemoteDevice(con);
			this.remoteDevice.set_keepalive_interval(1);
			this.updateStatus(InstanceStatus.Ok)

			this.updateActions() // export actions
			this.updateFeedbacks() // export feedbacks
			this.remoteDevice.get_role_map().then((map) => {
				if(map.get("Settings_Box/Settings_PwrOn")) {
					this.powerObj = map.get("Settings_Box/Settings_PwrOn")
					this.powerObj.GetPosition().then((v)=>{
						if(v.item(0) == 0) {
							this.powerState = true;
						}else {
							this.powerState = false;
						}
						this.checkFeedbacks('PowerState')
					})
					this.powerObj.OnPositionChanged.subscribe((val) => {
						if(val == 0) {
							this.powerState = true;
						}else {
							this.powerState = false;
						}
						this.checkFeedbacks('PowerState')
					});
				}
			})
			this.remoteDevice.get_device_tree().then((tree) => {
					var i = 0;
					tree.forEach((treeobj) => {

						if (Array.isArray(treeobj))
					  {

						treeobj.forEach((obj)=> {

							obj.GetClassIdentification().then((cls) => {
									if(cls.ClassID === RemoteControlClasses.OcaMute.ClassID) {

										this.muteObj.push(obj)
										if(i === 3) {
											this.ready = true;
											this.muteObj.forEach((v,index)=> {
												v.GetState().then((v)=> {
													if(v === Types.OcaMuteState.Muted) {
														this.muteState[index] = true;
													}else {
														this.muteState[index] = false;
													}
													this.checkFeedbacks('ChannelState')
												})
												v.OnStateChanged.subscribe((val) => {
													if(val == 1) {
														this.muteState[index] = true;
													}else {
														this.muteState[index] = false;
													}
													this.checkFeedbacks('ChannelState')
												});
											});
										}
										i++
									}
							});
						});
					  }
					})
			});
			this.updateStatus(InstanceStatus.Ok)
		}).catch((e)=> {
			this.ready = false;
			this.log("error", "Aes70 Device Connection Error try reconnect in 10 Seconds!")
			setTimeout(()=> {
				this.connect();
				this.updateStatus(InstanceStatus.ConnectionFailure)
			}, 10000);
		});
	}


	// When module gets deleted
	async destroy() {
		if(this.aescon) {
			this.muteObj = []
			this.aescon.close();
		}
		this.updateStatus(InstanceStatus.Disconnected)
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config

		if(this.aescon) {
			this.muteObj = []
			this.aescon.close()
			this.updateStatus(InstanceStatus.Connecting)
			this.connect();
		}
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
				default: "168.178.10.110"
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: Regex.PORT,
				default: 50014
			}
		]
	}

	updateActions() {
		updateA(this)
	}

	updateFeedbacks() {
		updateF(this)
	}

}

runEntrypoint(ModuleInstance,[])
