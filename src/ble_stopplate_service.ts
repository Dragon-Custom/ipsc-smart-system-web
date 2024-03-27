import { BuzzerWaveformType } from "./buzzer";

const SERVICE_UUID = "7a0247e7-8e88-409b-a959-ab5092ddb03e";
const START_SIGNAL_CHARACTERISTIC_UUID = "3c224d84-566d-4f13-8b1c-2117021ff1a2";
const STOP_SIGNAL_CHARACTERISTIC_UUID = "57b92756-3df4-4038-b825-fc8e1c2fdb5b";
const TIME_SYNC_REQUEST_CHARACTERISTIC_UUID =
    "840a0941-55e9-44e4-bfff-1c3c27bf6af0";
const TIME_SYNC_WRITE_CHARACTERISTIC_UUID =
    "e0832e3e-f1e1-43b1-9569-109e2770e3ed";
const SETTING_CHARACTERISTIC_UUID = "798f2478-4c44-417f-bb6e-ee2a826cc17c";
export interface StopplateCharacteristic {
    start_signal_char: BluetoothRemoteGATTCharacteristic;
    time_sync_request_char: BluetoothRemoteGATTCharacteristic;
    time_sync_write_char: BluetoothRemoteGATTCharacteristic;
    stopplate_signal_char: BluetoothRemoteGATTCharacteristic;
    setting_store_char: BluetoothRemoteGATTCharacteristic;
}

function time(text: string) {
	console.log("[" + new Date().toJSON().substr(11, 8) + "] " + text);
}
function exponentialBackoff(
	max: number,
	delay: number,
	toTry: () => Promise<void>,
	success: () => void,
	fail: () => void,
) {
	toTry()
		.then(() => success())
		.catch(() => {
			if (max === 0) {
				return fail();
			}
			time("Retrying in " + delay + "s... (" + max + " tries left)");
			setTimeout(function () {
				exponentialBackoff(--max, delay * 2, toTry, success, fail);
			}, delay * 1000);
		});
}

export interface StopplateSettingDTO {
    indicator_light_up_duration: number;
    countdown_random_time_min: number;
    countdown_random_time_max: number;
    buzzer_duration: number;
    buzzer_frequency: number;
    buzzer_waveform: number;
}

export type HitCallbackID = number;
export type HitCallback = (event: Event, value: string) => void;
export class NotConnectException extends Error {
	message: string = "Not Connected";
	constructor(message: string) {
		super(message);
	}
}
export class BLEStopplateService {
	static instance: BLEStopplateService;

	public static GetInstance(): BLEStopplateService {
		if (!BLEStopplateService.instance) {
			BLEStopplateService.instance = new BLEStopplateService();
		}
		return BLEStopplateService.instance;
	}

	private constructor() {
		// Private constructor to prevent direct instantiation
	}

	private _is_connected: boolean = false;
	public bluetooth_device?: BluetoothDevice;
	public bluetooth_gatt_server?: BluetoothRemoteGATTServer;
	public bluetooth_gatt_service?: BluetoothRemoteGATTService;
	public start_signal_char?: BluetoothRemoteGATTCharacteristic;
	public time_sync_request_char?: BluetoothRemoteGATTCharacteristic;
	public time_sync_write_char?: BluetoothRemoteGATTCharacteristic;
	public stopplate_signal_char?: BluetoothRemoteGATTCharacteristic;
	public setting_store_char?: BluetoothRemoteGATTCharacteristic;
	public on_hit_listener: HitCallback[] = [];

	public get is_connected() {
		return this.bluetooth_gatt_server?.connected || false;
	}

	private async scanStopplate() {
		const BLE_UI = await navigator.bluetooth.getAvailability();
		if (!BLE_UI) return false;
		try {
			const BLE_DEVICE = await navigator.bluetooth.requestDevice({
				filters: [{ services: [SERVICE_UUID] }],
			});
			if (!BLE_DEVICE?.gatt) return false;
			return BLE_DEVICE;
		} catch (e) {
			return false;
		}

	}

	private async connectStopplate(bleDevice: BluetoothDevice) {
		if (!bleDevice?.gatt) return;
		console.log("Connecting to GATT Server...");
		bleDevice.addEventListener(
			"gattserverdisconnected",
			this.onDeviceDisconnect,
		);
		this._is_connected = true;
		return await bleDevice.gatt.connect();
	}
	private onDeviceDisconnect() {
		if (this._is_connected) {
			this.reconnect();
		}
	}

	private async retriveStopplateServices(
		bleGattServer: BluetoothRemoteGATTServer,
	) {
		console.log("Getting Service...");
		return await bleGattServer.getPrimaryService(SERVICE_UUID);
	}

	private async retriveStopplateCharacteristic(
		bleService: BluetoothRemoteGATTService,
	): Promise<StopplateCharacteristic> {
		console.log("Getting characteristic...");
		const STOPPLATE_SIGNAL_CHAR = await bleService.getCharacteristic(
			STOP_SIGNAL_CHARACTERISTIC_UUID,
		);

		const START_SIGNAL_CHAR = await bleService.getCharacteristic(
			START_SIGNAL_CHARACTERISTIC_UUID,
		);
		const TIME_SYNC_REQUEST_CHAR = await bleService.getCharacteristic(
			TIME_SYNC_REQUEST_CHARACTERISTIC_UUID,
		);
		const TIME_SYNC_WRITE_CHAR = await bleService.getCharacteristic(
			TIME_SYNC_WRITE_CHARACTERISTIC_UUID,
		);
		const SETTING_STORE_CHAR = await bleService.getCharacteristic(
			SETTING_CHARACTERISTIC_UUID,
		);

		return {
			stopplate_signal_char: STOPPLATE_SIGNAL_CHAR,
			setting_store_char: SETTING_STORE_CHAR,
			start_signal_char: START_SIGNAL_CHAR,
			time_sync_request_char: TIME_SYNC_REQUEST_CHAR,
			time_sync_write_char: TIME_SYNC_WRITE_CHAR,
		};
	}
    
	public async scanAndConnectToStopplate() {
		const device = await this.scanStopplate();
		if (device == false)
			return false;
		this.bluetooth_device = device;
		if (!this.bluetooth_device) return;
		this.bluetooth_gatt_server = await this.connectStopplate(
			this.bluetooth_device,
		);
		if (!this.bluetooth_gatt_server) return;
		this.bluetooth_gatt_service = await this.retriveStopplateServices(
			this.bluetooth_gatt_server,
		);
		const {
			start_signal_char: START_SIGNAL_CHAR,
			stopplate_signal_char: STOPPLATE_SIGNAL_CHAR,
			setting_store_char: SETTING_STORE_CHAR,
			time_sync_request_char: TIME_SYNC_REQUEST_CHAR,
			time_sync_write_char: TIME_SYNC_WRITE_CHAR,
		} = await this.retriveStopplateCharacteristic(
			this.bluetooth_gatt_service,
		);
		if (
			!TIME_SYNC_REQUEST_CHAR ||
            !TIME_SYNC_WRITE_CHAR ||
            !STOPPLATE_SIGNAL_CHAR ||
            !SETTING_STORE_CHAR ||
            !START_SIGNAL_CHAR
		) {
			this.disconnect();
			return;
		}
		this.start_signal_char = START_SIGNAL_CHAR;
		this.time_sync_request_char = TIME_SYNC_REQUEST_CHAR;
		this.time_sync_write_char = TIME_SYNC_WRITE_CHAR;
		this.stopplate_signal_char = STOPPLATE_SIGNAL_CHAR;
		this.setting_store_char = SETTING_STORE_CHAR;
		await STOPPLATE_SIGNAL_CHAR.startNotifications();
		STOPPLATE_SIGNAL_CHAR.addEventListener(
			"characteristicvaluechanged",
			(event: Event) => {
				const val = new TextDecoder().decode(
                    (
                        event as unknown as {
                            target: { value: BufferSource };
                        }
                    ).target.value as BufferSource,
				);
				console.log("Hit data: %s current %s", val, Date.now());
				this.on_hit_listener.forEach((cb) => {
					cb(event, val);
				});
			},
		);
		await TIME_SYNC_REQUEST_CHAR.startNotifications();
		TIME_SYNC_REQUEST_CHAR.addEventListener(
			"characteristicvaluechanged",
			() => {
				TIME_SYNC_WRITE_CHAR.writeValue(
					new TextEncoder().encode(
						this.getPrecisionTime().toString(),
					),
				);
			},
		);
		await this.performTimeSync();
		console.log("BLE connect succes");
	}

	disconnect() {
		this.normalDisconnect();
	}

	reconnect() {
		return new Promise<void>((resolve, reject) => {
			exponentialBackoff(
				10 /* max retries */,
				3 /* seconds delay */,
				async() => {
					time("Connecting to Bluetooth Device... ");
					await this.bluetooth_device?.gatt?.connect();
				},
				async () => {
					console.log(
						"> Bluetooth Device connected. Try disconnect it now.",
					);
					if (typeof this.bluetooth_gatt_service === "undefined")
						reject();
					await this.retriveStopplateCharacteristic(
                        this.bluetooth_gatt_service as BluetoothRemoteGATTService,
					);
					resolve();
				},
				() => {
					time("Failed to reconnect.");
					this.normalDisconnect();
					reject();
				},
			);
		});
	}

	async performTimeSync() {
		await this.time_sync_request_char?.writeValue(
			new TextEncoder().encode("INIT"),
		);
	}

	private normalDisconnect() {
		console.log("Disconnected");
		this._is_connected = false;
		this.bluetooth_gatt_server?.disconnect();
		delete this.bluetooth_device;
		delete this.bluetooth_gatt_server;
		delete this.bluetooth_gatt_service;
		delete this.start_signal_char;
		delete this.time_sync_request_char;
		delete this.time_sync_write_char;
		delete this.stopplate_signal_char;
		delete this.setting_store_char;
	}
	async writeSetting(
		indicatorLightUpDuration: number,
		countdownRandomTimeMin: number,
		countdownRandomTimeMax: number,
		buzzerDuration: number,
		buzzerFrequency: number,
		buzzerWaveform: BuzzerWaveformType,
	) {
		indicatorLightUpDuration = Math.round(indicatorLightUpDuration);
		buzzerDuration = Math.round(buzzerDuration);
		buzzerFrequency = Math.round(buzzerFrequency);
		console.log(
			JSON.stringify({
				indicator_light_up_duration: indicatorLightUpDuration,
				countdown_random_time_min: countdownRandomTimeMin,
				countdown_random_time_max: countdownRandomTimeMax,
				buzzer_duration: buzzerDuration,
				buzzer_frequency: buzzerFrequency,
				buzzer_waveform: buzzerWaveform,
			}),
		);
		await this.setting_store_char?.writeValue(
			new TextEncoder().encode(
				JSON.stringify({
					indicator_light_up_duration: indicatorLightUpDuration,
					countdown_random_time_min: countdownRandomTimeMin,
					countdown_random_time_max: countdownRandomTimeMax,
					buzzer_duration: buzzerDuration,
					buzzer_frequency: buzzerFrequency,
					buzzer_waveform: buzzerWaveform,
				}),
			),
		);
	}
	async getSettings() {
		const SETTING_CHAR: DataView | undefined = await this.setting_store_char?.readValue();
		return JSON.parse(
			new TextDecoder().decode(SETTING_CHAR),
		) as StopplateSettingDTO;
	}
    
	checkConnectionState() {
		return this.is_connected;
	}

	registerHitCallback(
		callback: (event: Event, value: string) => void,
	): HitCallbackID {
		const cbid = Math.round(Math.random() * 10000);
		this.on_hit_listener[cbid] = callback;
		return cbid;
	}
	removeHitCallback(cbId: HitCallbackID) {
		delete this.on_hit_listener[cbId];
	}

	startTimer() {
		this.start_signal_char?.writeValue(
			new TextEncoder().encode(this.getPrecisionTime().toString()),
		);
	}

	getPrecisionTime() {
		return Date.now() * 0.001;
	}
}