import { RemoteControlClasses } from 'aes70'
import { define_custom_class } from 'aes70/src/controller/define_custom_class.js'
import { OcaInt8 } from 'aes70/src/OCP1/OcaInt8.js'

export let AmpPresets = define_custom_class(
	'AmpPresets',
	3,
	'1.2',
	2,
	'OcaAgent',
	[['SetPreset', 3, 3, [OcaInt8], [OcaInt8]]],
	[],
	[],
)
