export enum BuzzerWaveformType {
    SINE,
    SQUARE,
    SAWTOOTH,
    TRIANGLE,
}
export const BUZZER_WAVEFORM_OBJECT: OscillatorType[] = [
	"sine",
	"square",
	"sawtooth",
	"triangle",
];

export class Buzzer {
	static instance: Buzzer;
	osc: OscillatorNode;
	waveform: OscillatorType;
	hertz: number;
	gain: GainNode;

	private constructor() {
		this.waveform = "sawtooth";
		this.hertz = 1024;
		const audioContext = new window.AudioContext();

		this.osc = audioContext.createOscillator();
		this.osc.type = this.waveform;
		this.osc.frequency.value = this.hertz; // value in hertz

		this.gain = audioContext.createGain();
		this.gain.gain.value = 1;

		this.osc.connect(this.gain);
		this.gain.connect(audioContext.destination);
		this.osc.onended = () => {
			console.log("onended");
		};

		this.osc.start();
	}

	public static GetInstance(): Buzzer {
		if (!Buzzer.instance) {
			Buzzer.instance = new Buzzer();
		}
		return Buzzer.instance;
	}

	start(hertz: number, waveform: OscillatorType) {
		this.hertz = hertz;
		this.waveform = waveform;
		this.osc.type = this.waveform;
		this.osc.frequency.value = this.hertz;
		this.gain.gain.value = 1;
	}

	stop() {
		this.gain.gain.value = 0;
	}
}

export function beep(
	hertz: number,
	waveform: OscillatorType,
	timeinms: number,
	volume: number = 1,
) {
	Buzzer.GetInstance().gain.gain.value = volume;
	Buzzer.GetInstance().start(hertz, waveform);
	setTimeout(() => {
		Buzzer.GetInstance().stop();
	}, timeinms);
}