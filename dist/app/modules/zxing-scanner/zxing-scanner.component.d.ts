import { AfterViewInit, ElementRef, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Result } from '@zxing/library';
export declare class ZXingScannerComponent implements AfterViewInit, OnDestroy, OnChanges {
    /**
     * The ZXing code reader.
     */
    private codeReader;
    /**
     * Says if some native API is supported.
     */
    private isEnumerateDevicesSuported;
    /**
     * List of enable video-input devices.
     */
    private videoInputDevices;
    /**
     * The actual device used to scan things.
     */
    private videoInputDevice;
    /**
     * Says if the user allowedthe use of the camera or not.
     */
    private hasPermission;
    /**
     * Reference to the preview element, should be the `video` tag.
     */
    previewElemRef: ElementRef;
    /**
     * The scan throttling (time between scans) in milliseconds.
     */
    scanThrottling: number;
    /**
     * Allow start scan or not.
     */
    scannerEnabled: boolean;
    /**
     * The device that should be used to scan things.
     */
    device: MediaDeviceInfo;
    /**
     * The value of the HTML video's class attribute.
     */
    cssClass: string;
    /**
     * Enable or disable autofocus of the camera (might have an impact on performance)
     */
    autofocusEnabled: boolean;
    /**
     * Emitts events when a scan is successful performed, will inject the string value of the QR-code to the callback.
     */
    scanSuccess: EventEmitter<string>;
    /**
     * Emitts events when a scan fails without errors, usefull to know how much scan tries where made.
     */
    scanFailure: EventEmitter<void>;
    /**
     * Emitts events when a scan throws some error, will inject the error to the callback.
     */
    scanError: EventEmitter<Error>;
    /**
     * Emitts events when a scan is performed, will inject the Result value of the QR-code scan (if available) to the callback.
     */
    scanComplete: EventEmitter<Result>;
    /**
     * Emitts events when no cameras are found, will inject an exception (if available) to the callback.
     */
    camerasFound: EventEmitter<MediaDeviceInfo[]>;
    /**
     * Emitts events when no cameras are found, will inject an exception (if available) to the callback.
     */
    camerasNotFound: EventEmitter<any>;
    /**
     * Emitts events when the users answers for permission.
     */
    permissionResponse: EventEmitter<boolean>;
    /**
     * Constructor to build the object and do some DI.
     */
    constructor();
    /**
     * Manages the bindinded property changes.
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void;
    /**
     * Executed after the view initialization.
     */
    ngAfterViewInit(): void;
    /**
     * Executes some actions before destroy the component.
     */
    ngOnDestroy(): void;
    /**
     * Starts a new QR-scanner to set a new scan throttling.
     *
     * @param throttling The scan speed in milliseconds.
     */
    setCodeReaderThrottling(throttling: number): void;
    /**
     * Properly changes the actual target device.
     *
     * @param device
     */
    changeDevice(device: MediaDeviceInfo): void;
    /**
     * Properly changes the actual target device using it's deviceId.
     *
     * @param deviceId
     */
    changeDeviceById(deviceId: string): void;
    /**
     * Properly returns the target device using it's deviceId.
     *
     * @param deviceId
     */
    getDeviceById(deviceId: string): MediaDeviceInfo;
    /**
     * Gets and registers all cammeras.
     */
    askForPermission(): EventEmitter<boolean>;
    /**
     * Starts the continuous scanning for the given device.
     *
     * @param deviceId The deviceId from the device.
     */
    scan(deviceId: string): void;
    /**
     * Starts the scanning if allowed.
     *
     * @param device The device to be used in the scan.
     */
    startScan(device: MediaDeviceInfo): void;
    /**
     * Stops the scan service.
     */
    resetScan(): void;
    /**
     * Dispatches the scan success event.
     *
     * @param result the scan result.
     */
    private dispatchScanSuccess(result);
    /**
     * Dispatches the scan failure event.
     */
    private dispatchScanFailure();
    /**
     * Dispatches the scan error event.
     *
     * @param err the error thing.
     */
    private dispatchScanError(error);
    /**
     * Dispatches the scan event.
     *
     * @param result the scan result.
     */
    private dispatchScanComplete(result);
    /**
     * Enumerates all the available devices.
     *
     * @param successCallback
     */
    enumarateVideoDevices(successCallback: any): void;
}
