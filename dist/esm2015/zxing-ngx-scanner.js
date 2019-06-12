import { BinaryBitmap, HybridBinarizer, Exception, HTMLCanvasElementLuminanceSource, QRCodeReader } from '@zxing/library';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Based on zxing-typescript BrowserCodeReader
 */
class BrowserCodeReader {
    /**
     * Constructor for dependency injection.
     *
     * @param {?} reader The barcode reader to be used to decode the stream.
     * @param {?=} timeBetweenScans The scan throttling in milliseconds.
     */
    constructor(reader, timeBetweenScans = 500) {
        this.reader = reader;
        this.timeBetweenScans = timeBetweenScans;
    }
    /**
     * Starts the decoding from the actual or a new video element.
     *
     * @param {?} callbackFn The callback to be executed after every scan attempt
     * @param {?=} deviceId The device's to be used Id
     * @param {?=} videoElement A new video element
     * @return {?}
     */
    decodeFromInputVideoDevice(callbackFn, deviceId, videoElement) {
        this.reset();
        this.prepareVideoElement(videoElement);
        const /** @type {?} */ video = deviceId === undefined
            ? { facingMode: { exact: 'environment' } }
            : { deviceId: { exact: deviceId } };
        const /** @type {?} */ constraints = {
            audio: false,
            video
        };
        navigator
            .mediaDevices
            .getUserMedia(constraints)
            .then((stream) => this.startDecodeFromStream(stream, callbackFn))
            .catch((err) => {
            /* handle the error, or not */
            console.error(err);
        });
    }
    /**
     * Sets the new stream and request a new decoding-with-delay.
     *
     * @param {?} stream The stream to be shown in the video element.
     * @param {?} callbackFn A callback for the decode method.
     * @return {?}
     */
    startDecodeFromStream(stream, callbackFn) {
        this.stream = stream;
        // Older browsers may not have srcObject
        if ('srcObject' in this.videoElement) {
            // @NOTE Throws Exception if interrupted by a new loaded request
            this.videoElement.srcObject = this.stream;
        }
        else {
            // @NOTE Avoid using this in new browsers, as it is going away.
            (/** @type {?} */ (this.videoElement)).src = window.URL.createObjectURL(stream);
        }
        this.videoPlayingEventListener = () => {
            this.decodeWithDelay(callbackFn);
        };
        this.videoElement.addEventListener('play', this.videoPlayingEventListener);
        this.videoLoadedMetadataEventListener = () => {
            this.videoElement.play();
        };
        this.videoElement.addEventListener('loadedmetadata', this.videoLoadedMetadataEventListener);
    }
    /**
     * Sets a HTMLVideoElement for scanning or creates a new one.
     *
     * @param {?=} videoElement The HTMLVideoElement to be set.
     * @return {?}
     */
    prepareVideoElement(videoElement) {
        if (!videoElement) {
            this.videoElement = document.createElement('video');
            this.videoElement.width = 200;
            this.videoElement.height = 200;
        }
        else {
            this.videoElement = videoElement;
        }
    }
    /**
     *
     * @param {?} callbackFn
     * @return {?}
     */
    decodeWithDelay(callbackFn) {
        if (this.videoElement || this.imageElement) {
            this.timeoutHandler = window.setTimeout(this.decode.bind(this, callbackFn), this.timeBetweenScans);
        }
    }
    /**
     * Does the real image decoding job.
     *
     * @param {?} callbackFn
     * @param {?=} retryIfNotFound
     * @param {?=} retryIfChecksumOrFormatError
     * @param {?=} once
     * @return {?}
     */
    decode(callbackFn, retryIfNotFound = true, retryIfChecksumOrFormatError = true, once = false) {
        if (undefined === this.canvasElementContext) {
            this.prepareCaptureCanvas();
        }
        this.canvasElementContext.drawImage(this.videoElement || this.imageElement, 0, 0);
        const /** @type {?} */ luminanceSource = new HTMLCanvasElementLuminanceSource(this.canvasElement);
        const /** @type {?} */ binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
        try {
            const /** @type {?} */ result = this.readerDecode(binaryBitmap);
            callbackFn(result);
            // if (!once && !!this.stream) {
            //     setTimeout(() => this.decodeWithDelay(callbackFn), this.timeBetweenScans);
            // }
        }
        catch (/** @type {?} */ re) {
            console.debug(retryIfChecksumOrFormatError, re);
            if (retryIfNotFound && Exception.isOfType(re, Exception.NotFoundException)) {
                console.debug('zxing-scanner', 'QR-code not-found, trying again...');
                this.decodeWithDelay(callbackFn);
            }
            else if (retryIfChecksumOrFormatError &&
                (Exception.isOfType(re, Exception.ChecksumException) ||
                    Exception.isOfType(re, Exception.FormatException))) {
                console.warn('zxing-scanner', 'Checksum or format error, trying again...', re);
                this.decodeWithDelay(callbackFn);
            }
        }
    }
    /**
     * Alias for this.reader.decode
     *
     * @param {?} binaryBitmap
     * @return {?}
     */
    readerDecode(binaryBitmap) {
        return this.reader.decode(binaryBitmap);
    }
    /**
     * 🖌 Prepares the canvas for capture and scan frames.
     * @return {?}
     */
    prepareCaptureCanvas() {
        const /** @type {?} */ canvasElement = document.createElement('canvas');
        let /** @type {?} */ width;
        let /** @type {?} */ height;
        if (undefined !== this.videoElement) {
            width = this.videoElement.videoWidth;
            height = this.videoElement.videoHeight;
        }
        else {
            width = this.imageElement.naturalWidth || this.imageElement.width;
            height = this.imageElement.naturalHeight || this.imageElement.height;
        }
        canvasElement.style.width = width + 'px';
        canvasElement.style.height = height + 'px';
        canvasElement.width = width;
        canvasElement.height = height;
        this.canvasElement = canvasElement;
        this.canvasElementContext = canvasElement.getContext('2d');
    }
    /**
     * Stops the continuous scan and cleans the stream.
     * @return {?}
     */
    stop() {
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
        if (this.stream) {
            this.stream.getTracks()[0].stop();
            this.stream = null;
        }
    }
    /**
     * Resets the scanner and it's configurations.
     * @return {?}
     */
    reset() {
        // stops the camera, preview and scan 🔴
        this.stop();
        if (this.videoElement) {
            // first gives freedon to the element 🕊
            if (undefined !== this.videoPlayEndedEventListener) {
                this.videoElement.removeEventListener('ended', this.videoPlayEndedEventListener);
            }
            if (undefined !== this.videoPlayingEventListener) {
                this.videoElement.removeEventListener('play', this.videoPlayingEventListener);
            }
            if (undefined !== this.videoLoadedMetadataEventListener) {
                this.videoElement.removeEventListener('loadedmetadata', this.videoLoadedMetadataEventListener);
            }
            // then forgets about that element 😢
            // Clear the stream
            if (this.videoElement.srcObject)
                (/** @type {?} */ (this.videoElement.srcObject)).getTracks()[0].stop();
            this.videoElement.srcObject = undefined;
            this.videoElement.removeAttribute('src');
            this.videoElement = undefined;
        }
        if (this.imageElement) {
            // first gives freedon to the element 🕊
            if (undefined !== this.videoPlayEndedEventListener) {
                this.imageElement.removeEventListener('load', this.imageLoadedEventListener);
            }
            // then forgets about that element 😢
            this.imageElement.src = undefined;
            this.imageElement.removeAttribute('src');
            this.imageElement = undefined;
        }
        // cleans canvas references 🖌
        this.canvasElementContext = undefined;
        this.canvasElement = undefined;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class BrowserQRCodeReader extends BrowserCodeReader {
    /**
     * @param {?=} timeBetweenScansMillis
     */
    constructor(timeBetweenScansMillis = 500) {
        super(new QRCodeReader(), timeBetweenScansMillis);
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class ZXingScannerComponent {
    /**
     * Constructor to build the object and do some DI.
     */
    constructor() {
        /**
         * The ZXing code reader.
         */
        this.codeReader = new BrowserQRCodeReader(1500);
        /**
         * The scan throttling (time between scans) in milliseconds.
         */
        this.scanThrottling = 1500;
        /**
         * Allow start scan or not.
         */
        this.scannerEnabled = true;
        /**
         * Enable or disable autofocus of the camera (might have an impact on performance)
         */
        this.autofocusEnabled = true;
        /**
         * Emitts events when a scan is successful performed, will inject the string value of the QR-code to the callback.
         */
        this.scanSuccess = new EventEmitter();
        /**
         * Emitts events when a scan fails without errors, usefull to know how much scan tries where made.
         */
        this.scanFailure = new EventEmitter();
        /**
         * Emitts events when a scan throws some error, will inject the error to the callback.
         */
        this.scanError = new EventEmitter();
        /**
         * Emitts events when a scan is performed, will inject the Result value of the QR-code scan (if available) to the callback.
         */
        this.scanComplete = new EventEmitter();
        /**
         * Emitts events when no cameras are found, will inject an exception (if available) to the callback.
         */
        this.camerasFound = new EventEmitter();
        /**
         * Emitts events when no cameras are found, will inject an exception (if available) to the callback.
         */
        this.camerasNotFound = new EventEmitter();
        /**
         * Emitts events when the users answers for permission.
         */
        this.permissionResponse = new EventEmitter();
        this.isEnumerateDevicesSuported = !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
    }
    /**
     * Manages the bindinded property changes.
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes["scannerEnabled"]) {
            if (!this.scannerEnabled) {
                this.resetScan();
            }
            else if (this.videoInputDevice) {
                this.scan(this.videoInputDevice.deviceId);
            }
        }
        if (changes["device"]) {
            if (this.device) {
                this.changeDevice(this.device);
            }
            else {
                console.warn('zxing-scanner', 'device', 'Unselected device.');
                this.resetScan();
            }
        }
        if (changes["scanThrottling"]) {
            this.setCodeReaderThrottling(this.scanThrottling);
        }
    }
    /**
     * Executed after the view initialization.
     * @return {?}
     */
    ngAfterViewInit() {
        // Chrome 63 fix
        if (!this.previewElemRef) {
            console.warn('zxing-scanner', 'Preview element not found!');
            return;
        }
        // iOS 11 Fix
        this.previewElemRef.nativeElement.setAttribute('autoplay', false);
        this.previewElemRef.nativeElement.setAttribute('muted', true);
        this.previewElemRef.nativeElement.setAttribute('playsinline', true);
        this.previewElemRef.nativeElement.setAttribute('autofocus', this.autofocusEnabled);
        this.askForPermission().subscribe((hasPermission) => {
            if (hasPermission) {
                // gets and enumerates all video devices
                this.enumarateVideoDevices((videoInputDevices) => {
                    if (videoInputDevices && videoInputDevices.length > 0) {
                        this.camerasFound.next(videoInputDevices);
                    }
                    else {
                        this.camerasNotFound.next();
                    }
                });
                this.startScan(this.videoInputDevice);
            }
            else {
                console.warn('User has denied permission.');
            }
        });
    }
    /**
     * Executes some actions before destroy the component.
     * @return {?}
     */
    ngOnDestroy() {
        this.resetScan();
    }
    /**
     * Starts a new QR-scanner to set a new scan throttling.
     *
     * @param {?} throttling The scan speed in milliseconds.
     * @return {?}
     */
    setCodeReaderThrottling(throttling) {
        this.codeReader = new BrowserQRCodeReader(throttling);
    }
    /**
     * Properly changes the actual target device.
     *
     * @param {?} device
     * @return {?}
     */
    changeDevice(device) {
        this.videoInputDevice = device;
        this.startScan(device);
    }
    /**
     * Properly changes the actual target device using it's deviceId.
     *
     * @param {?} deviceId
     * @return {?}
     */
    changeDeviceById(deviceId) {
        this.changeDevice(this.getDeviceById(deviceId));
    }
    /**
     * Properly returns the target device using it's deviceId.
     *
     * @param {?} deviceId
     * @return {?}
     */
    getDeviceById(deviceId) {
        return this.videoInputDevices.find(device => device.deviceId === deviceId);
    }
    /**
     * Gets and registers all cammeras.
     * @return {?}
     */
    askForPermission() {
        // Will try to ask for permission
        navigator
            .mediaDevices
            .getUserMedia({ audio: false, video: true })
            .then((stream) => {
            try {
                // Start stream so Browser can display permission-dialog ("Website wants to access your camera, allow?")
                this.previewElemRef.nativeElement.srcObject = stream;
                // After permission was granted, we can stop it again
                stream.getVideoTracks().forEach(track => {
                    track.stop();
                });
                this.previewElemRef.nativeElement.srcObject = undefined;
                // if the scripts lives until here, that's only one mean:
                // permission granted
                this.hasPermission = true;
                this.permissionResponse.next(this.hasPermission);
            }
            catch (/** @type {?} */ err) {
                console.error('zxing-scanner', 'askForPermission', err);
                // permission aborted
                this.hasPermission = undefined;
                this.permissionResponse.next(undefined);
            }
        })
            .catch((err) => {
            // failed to grant permission to video input
            console.warn('zxing-scanner', 'askForPermission', err);
            switch (err.name) {
                case 'NotAllowedError':
                    // permission denied
                    this.hasPermission = false;
                    this.permissionResponse.next(this.hasPermission);
                    break;
                case 'NotFoundError':
                    this.camerasNotFound.next(err);
                    break;
                default:
                    this.permissionResponse.next(undefined);
                    break;
            }
        });
        // Returns the event emitter, so thedev can subscribe to it
        return this.permissionResponse;
    }
    /**
     * Starts the continuous scanning for the given device.
     *
     * @param {?} deviceId The deviceId from the device.
     * @return {?}
     */
    scan(deviceId) {
        try {
            this.codeReader.decodeFromInputVideoDevice((result) => {
                console.debug('zxing-scanner', 'scan', 'result: ', result);
                if (result) {
                    this.dispatchScanSuccess(result);
                }
                else {
                    this.dispatchScanFailure();
                }
                this.dispatchScanComplete(result);
            }, deviceId, this.previewElemRef.nativeElement);
        }
        catch (/** @type {?} */ err) {
            this.dispatchScanError(err);
            this.dispatchScanComplete(undefined);
        }
    }
    /**
     * Starts the scanning if allowed.
     *
     * @param {?} device The device to be used in the scan.
     * @return {?}
     */
    startScan(device) {
        if (this.scannerEnabled && device) {
            this.scan(device.deviceId);
        }
    }
    /**
     * Stops the scan service.
     * @return {?}
     */
    resetScan() {
        this.codeReader.reset();
    }
    /**
     * Dispatches the scan success event.
     *
     * @param {?} result the scan result.
     * @return {?}
     */
    dispatchScanSuccess(result) {
        this.scanSuccess.next(result.getText());
    }
    /**
     * Dispatches the scan failure event.
     * @return {?}
     */
    dispatchScanFailure() {
        this.scanFailure.next();
    }
    /**
     * Dispatches the scan error event.
     *
     * @param {?} error
     * @return {?}
     */
    dispatchScanError(error) {
        this.scanError.next(error);
    }
    /**
     * Dispatches the scan event.
     *
     * @param {?} result the scan result.
     * @return {?}
     */
    dispatchScanComplete(result) {
        this.scanComplete.next(result);
    }
    /**
     * Enumerates all the available devices.
     *
     * @param {?} successCallback
     * @return {?}
     */
    enumarateVideoDevices(successCallback) {
        if (!this.isEnumerateDevicesSuported) {
            console.error('zxing-scanner', 'enumarateVideoDevices', 'Can\'t enumerate devices, method not supported.');
            return;
        }
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            this.videoInputDevices = [];
            for (const /** @type {?} */ deviceI of devices) {
                // @todo type this as `MediaDeviceInfo`
                const /** @type {?} */ device = {};
                // tslint:disable-next-line:forin
                for (const /** @type {?} */ key in deviceI) {
                    device[key] = deviceI[key];
                }
                if (device.kind === 'video') {
                    device.kind = 'videoinput';
                }
                if (!device.deviceId) {
                    device.deviceId = (/** @type {?} */ (device)).id;
                }
                if (!device.label) {
                    device.label = 'Camera (no-permission)';
                }
                if (device.kind === 'videoinput') {
                    this.videoInputDevices.push(device);
                }
            }
            successCallback(this.videoInputDevices);
        });
    }
}
ZXingScannerComponent.decorators = [
    { type: Component, args: [{
                selector: 'zxing-scanner',
                template: `<video [ngClass]="cssClass" #preview>
    <p>
        Your browser does not support this feature, please try to upgrade it.
    </p>
    <p>
        Seu navegador não suporta este recurso, por favor tente atualizá-lo.
    </p>
</video>
`,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/** @nocollapse */
ZXingScannerComponent.ctorParameters = () => [];
ZXingScannerComponent.propDecorators = {
    "previewElemRef": [{ type: ViewChild, args: ['preview',] },],
    "scanThrottling": [{ type: Input },],
    "scannerEnabled": [{ type: Input },],
    "device": [{ type: Input },],
    "cssClass": [{ type: Input },],
    "autofocusEnabled": [{ type: Input },],
    "scanSuccess": [{ type: Output },],
    "scanFailure": [{ type: Output },],
    "scanError": [{ type: Output },],
    "scanComplete": [{ type: Output },],
    "camerasFound": [{ type: Output },],
    "camerasNotFound": [{ type: Output },],
    "permissionResponse": [{ type: Output },],
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class ZXingScannerModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: ZXingScannerModule
        };
    }
}
ZXingScannerModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    FormsModule
                ],
                declarations: [ZXingScannerComponent],
                exports: [ZXingScannerComponent],
            },] },
];
/** @nocollapse */
ZXingScannerModule.ctorParameters = () => [];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { ZXingScannerModule, ZXingScannerComponent as ɵa };
//# sourceMappingURL=zxing-ngx-scanner.js.map
