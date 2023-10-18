import { combineRgb } from '@companion-module/base'
import { Types } from 'aes70'
export async function updateF(self) {
	self.setFeedbackDefinitions({
		ChannelState: {
			name: 'Muted Amp Channel Feedback',
			type: 'boolean',
			label: 'Channel State',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'feedmute',
					type: 'dropdown',
					label: 'Channel',
					choices: [
						{ id: 0, label: 'A' },
						{ id: 1, label: 'B' },
						{ id: 2, label: 'C' },
						{ id: 3, label: 'D' },
					],
					default: 0,
				},
			],
			callback: (feedback) => {
				if (self.ready) {
					return self.muteState[feedback.options.feedmute]
				}
			},
		},
		PowerState: {
			name: 'Power Amp Feedback',
			type: 'boolean',
			label: 'Power Amp',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: (feedback) => {
				if (self.ready) {
					return self.powerState
				}
			},
		},
	})
}
