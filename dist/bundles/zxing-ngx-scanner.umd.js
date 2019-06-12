(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@zxing/library'), require('@angular/core'), require('@angular/common'), require('@angular/forms')) :
	typeof define === 'function' && define.amd ? define(['exports', '@zxing/library', '@angular/core', '@angular/common', '@angular/forms'], factory) :
	(factory((global.zxing = global.zxing || {}, global.zxing['ngx-scanner'] = {}),global.library,global.ng.core,global.ng.common,global.ng.forms));
}(this, (function (exports,library,core,common,forms) { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */
var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}








function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

var BrowserCodeReader = /** @class */ (function () {
    function BrowserCodeReader(reader, timeBetweenScans) {
        if (timeBetweenScans === void 0) { timeBetweenScans = 500; }
        this.reader = reader;
        this.timeBetweenScans = timeBetweenScans;
    }
    BrowserCodeReader.prototype.decodeFromInputVideoDevice = function (callbackFn, deviceId, videoElement) {
        var _this = this;
        this.reset();
        this.prepareVideoElement(videoElement);
        var video = deviceId === undefined
            ? { facingMode: { exact: 'environment' } }
            : { deviceId: { exact: deviceId } };
        var constraints = {
            audio: false,
            video: video
        };
        navigator
            .mediaDevices
            .getUserMedia(constraints)
            .then(function (stream) { return _this.startDecodeFromStream(stream, callbackFn); })
            .catch(function (err) {
            console.error(err);
        });
    };
    BrowserCodeReader.prototype.startDecodeFromStream = function (stream, callbackFn) {
        var _this = this;
        this.stream = stream;
        if ('srcObject' in this.videoElement) {
            this.videoElement.srcObject = this.stream;
        }
        else {
            ((this.videoElement)).src = window.URL.createObjectURL(stream);
        }
        this.videoPlayingEventListener = function () {
            _this.decodeWithDelay(callbackFn);
        };
        this.videoElement.addEventListener('play', this.videoPlayingEventListener);
        this.videoLoadedMetadataEventListener = function () {
            _this.videoElement.play();
        };
        this.videoElement.addEventListener('loadedmetadata', this.videoLoadedMetadataEventListener);
    };
    BrowserCodeReader.prototype.prepareVideoElement = function (videoElement) {
        if (!videoElement) {
            this.videoElement = document.createElement('video');
            this.videoElement.width = 200;
            this.videoElement.height = 200;
        }
        else {
            this.videoElement = videoElement;
        }
    };
    BrowserCodeReader.prototype.decodeWithDelay = function (callbackFn) {
        if (this.videoElement || this.imageElement) {
            this.timeoutHandler = window.setTimeout(this.decode.bind(this, callbackFn), this.timeBetweenScans);
        }
    };
    BrowserCodeReader.prototype.decode = function (callbackFn, retryIfNotFound, retryIfChecksumOrFormatError, once) {
        var _this = this;
        if (retryIfNotFound === void 0) { retryIfNotFound = true; }
        if (retryIfChecksumOrFormatError === void 0) { retryIfChecksumOrFormatError = true; }
        if (once === void 0) { once = false; }
        if (undefined === this.canvasElementContext) {
            this.prepareCaptureCanvas();
        }
        this.canvasElementContext.drawImage(this.videoElement || this.imageElement, 0, 0);
        var luminanceSource = new library.HTMLCanvasElementLuminanceSource(this.canvasElement);
        var binaryBitmap = new library.BinaryBitmap(new library.HybridBinarizer(luminanceSource));
        try {
            var result = this.readerDecode(binaryBitmap);
            callbackFn(result);
            if (!once && !!this.stream) {
                setTimeout(function () { return _this.decodeWithDelay(callbackFn); }, this.timeBetweenScans);
            }
        }
        catch (re) {
            console.debug(retryIfChecksumOrFormatError, re);
            if (retryIfNotFound && library.Exception.isOfType(re, library.Exception.NotFoundException)) {
                console.debug('zxing-scanner', 'QR-code not-found, trying again...');
                this.decodeWithDelay(callbackFn);
            }
            else if (retryIfChecksumOrFormatError &&
                (library.Exception.isOfType(re, library.Exception.ChecksumException) ||
                    library.Exception.isOfType(re, library.Exception.FormatException))) {
                console.warn('zxing-scanner', 'Checksum or format error, trying again...', re);
                this.decodeWithDelay(callbackFn);
            }
        }
    };
    BrowserCodeReader.prototype.readerDecode = function (binaryBitmap) {
        return this.reader.decode(binaryBitmap);
    };
    BrowserCodeReader.prototype.prepareCaptureCanvas = function () {
        var canvasElement = document.createElement('canvas');
        var width;
        var height;
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
    };
    BrowserCodeReader.prototype.stop = function () {
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
        if (this.stream) {
            this.stream.getTracks()[0].stop();
            this.stream = null;
        }
    };
    BrowserCodeReader.prototype.reset = function () {
        this.stop();
        if (this.videoElement) {
            if (undefined !== this.videoPlayEndedEventListener) {
                this.videoElement.removeEventListener('ended', this.videoPlayEndedEventListener);
            }
            if (undefined !== this.videoPlayingEventListener) {
                this.videoElement.removeEventListener('play', this.videoPlayingEventListener);
            }
            if (undefined !== this.videoLoadedMetadataEventListener) {
                this.videoElement.removeEventListener('loadedmetadata', this.videoLoadedMetadataEventListener);
            }
            ((this.videoElement.srcObject)).getTracks()[0].stop();
            this.videoElement.srcObject = undefined;
            this.videoElement.removeAttribute('src');
            this.videoElement = undefined;
        }
        if (this.imageElement) {
            if (undefined !== this.videoPlayEndedEventListener) {
                this.imageElement.removeEventListener('load', this.imageLoadedEventListener);
            }
            this.imageElement.src = undefined;
            this.imageElement.removeAttribute('src');
            this.imageElement = undefined;
        }
        this.canvasElementContext = undefined;
        this.canvasElement = undefined;
    };
    return BrowserCodeReader;
}());
var BrowserQRCodeReader = /** @class */ (function (_super) {
    __extends(BrowserQRCodeReader, _super);
    function BrowserQRCodeReader(timeBetweenScansMillis) {
        if (timeBetweenScansMillis === void 0) { timeBetweenScansMillis = 500; }
        return _super.call(this, new library.QRCodeReader(), timeBetweenScansMillis) || this;
    }
    return BrowserQRCodeReader;
}(BrowserCodeReader));
var ZXingScannerComponent = /** @class */ (function () {
    function ZXingScannerComponent() {
        this.codeReader = new BrowserQRCodeReader(1500);
        this.scanThrottling = 1500;
        this.scannerEnabled = true;
        this.autofocusEnabled = true;
        this.scanSuccess = new core.EventEmitter();
        this.scanFailure = new core.EventEmitter();
        this.scanError = new core.EventEmitter();
        this.scanComplete = new core.EventEmitter();
        this.camerasFound = new core.EventEmitter();
        this.camerasNotFound = new core.EventEmitter();
        this.permissionResponse = new core.EventEmitter();
        this.isEnumerateDevicesSuported = !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
    }
    ZXingScannerComponent.prototype.ngOnChanges = function (changes) {
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
    };
    ZXingScannerComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (!this.previewElemRef) {
            console.warn('zxing-scanner', 'Preview element not found!');
            return;
        }
        this.previewElemRef.nativeElement.setAttribute('autoplay', false);
        this.previewElemRef.nativeElement.setAttribute('muted', true);
        this.previewElemRef.nativeElement.setAttribute('playsinline', true);
        this.previewElemRef.nativeElement.setAttribute('autofocus', this.autofocusEnabled);
        this.askForPermission().subscribe(function (hasPermission) {
            if (hasPermission) {
                _this.enumarateVideoDevices(function (videoInputDevices) {
                    if (videoInputDevices && videoInputDevices.length > 0) {
                        _this.camerasFound.next(videoInputDevices);
                    }
                    else {
                        _this.camerasNotFound.next();
                    }
                });
                _this.startScan(_this.videoInputDevice);
            }
            else {
                console.warn('User has denied permission.');
            }
        });
    };
    ZXingScannerComponent.prototype.ngOnDestroy = function () {
        this.resetScan();
    };
    ZXingScannerComponent.prototype.setCodeReaderThrottling = function (throttling) {
        this.codeReader = new BrowserQRCodeReader(throttling);
    };
    ZXingScannerComponent.prototype.changeDevice = function (device) {
        this.videoInputDevice = device;
        this.startScan(device);
    };
    ZXingScannerComponent.prototype.changeDeviceById = function (deviceId) {
        this.changeDevice(this.getDeviceById(deviceId));
    };
    ZXingScannerComponent.prototype.getDeviceById = function (deviceId) {
        return this.videoInputDevices.find(function (device) { return device.deviceId === deviceId; });
    };
    ZXingScannerComponent.prototype.askForPermission = function () {
        var _this = this;
        navigator
            .mediaDevices
            .getUserMedia({ audio: false, video: true })
            .then(function (stream) {
            try {
                _this.previewElemRef.nativeElement.srcObject = stream;
                stream.getVideoTracks().forEach(function (track) {
                    track.stop();
                });
                _this.previewElemRef.nativeElement.srcObject = undefined;
                _this.hasPermission = true;
                _this.permissionResponse.next(_this.hasPermission);
            }
            catch (err) {
                console.error('zxing-scanner', 'askForPermission', err);
                _this.hasPermission = undefined;
                _this.permissionResponse.next(undefined);
            }
        })
            .catch(function (err) {
            console.warn('zxing-scanner', 'askForPermission', err);
            switch (err.name) {
                case 'NotAllowedError':
                    _this.hasPermission = false;
                    _this.permissionResponse.next(_this.hasPermission);
                    break;
                case 'NotFoundError':
                    _this.camerasNotFound.next(err);
                    break;
                default:
                    _this.permissionResponse.next(undefined);
                    break;
            }
        });
        return this.permissionResponse;
    };
    ZXingScannerComponent.prototype.scan = function (deviceId) {
        var _this = this;
        try {
            this.codeReader.decodeFromInputVideoDevice(function (result) {
                console.debug('zxing-scanner', 'scan', 'result: ', result);
                if (result) {
                    _this.dispatchScanSuccess(result);
                }
                else {
                    _this.dispatchScanFailure();
                }
                _this.dispatchScanComplete(result);
            }, deviceId, this.previewElemRef.nativeElement);
        }
        catch (err) {
            this.dispatchScanError(err);
            this.dispatchScanComplete(undefined);
        }
    };
    ZXingScannerComponent.prototype.startScan = function (device) {
        if (this.scannerEnabled && device) {
            this.scan(device.deviceId);
        }
    };
    ZXingScannerComponent.prototype.resetScan = function () {
        this.codeReader.reset();
    };
    ZXingScannerComponent.prototype.dispatchScanSuccess = function (result) {
        this.scanSuccess.next(result.getText());
    };
    ZXingScannerComponent.prototype.dispatchScanFailure = function () {
        this.scanFailure.next();
    };
    ZXingScannerComponent.prototype.dispatchScanError = function (error) {
        this.scanError.next(error);
    };
    ZXingScannerComponent.prototype.dispatchScanComplete = function (result) {
        this.scanComplete.next(result);
    };
    ZXingScannerComponent.prototype.enumarateVideoDevices = function (successCallback) {
        var _this = this;
        if (!this.isEnumerateDevicesSuported) {
            console.error('zxing-scanner', 'enumarateVideoDevices', 'Can\'t enumerate devices, method not supported.');
            return;
        }
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
            _this.videoInputDevices = [];
            try {
                for (var devices_1 = __values(devices), devices_1_1 = devices_1.next(); !devices_1_1.done; devices_1_1 = devices_1.next()) {
                    var deviceI = devices_1_1.value;
                    var device = {};
                    for (var key in deviceI) {
                        device[key] = deviceI[key];
                    }
                    if (device.kind === 'video') {
                        device.kind = 'videoinput';
                    }
                    if (!device.deviceId) {
                        device.deviceId = ((device)).id;
                    }
                    if (!device.label) {
                        device.label = 'Camera (no-permission)';
                    }
                    if (device.kind === 'videoinput') {
                        _this.videoInputDevices.push(device);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (devices_1_1 && !devices_1_1.done && (_a = devices_1.return)) _a.call(devices_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            successCallback(_this.videoInputDevices);
            var e_1, _a;
        });
    };
    return ZXingScannerComponent;
}());
ZXingScannerComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'zxing-scanner',
                template: "<video [ngClass]=\"cssClass\" #preview>\n    <p>\n        Your browser does not support this feature, please try to upgrade it.\n    </p>\n    <p>\n        Seu navegador n\u00E3o suporta este recurso, por favor tente atualiz\u00E1-lo.\n    </p>\n</video>\n",
                changeDetection: core.ChangeDetectionStrategy.OnPush
            },] },
];
ZXingScannerComponent.ctorParameters = function () { return []; };
ZXingScannerComponent.propDecorators = {
    "previewElemRef": [{ type: core.ViewChild, args: ['preview',] },],
    "scanThrottling": [{ type: core.Input },],
    "scannerEnabled": [{ type: core.Input },],
    "device": [{ type: core.Input },],
    "cssClass": [{ type: core.Input },],
    "autofocusEnabled": [{ type: core.Input },],
    "scanSuccess": [{ type: core.Output },],
    "scanFailure": [{ type: core.Output },],
    "scanError": [{ type: core.Output },],
    "scanComplete": [{ type: core.Output },],
    "camerasFound": [{ type: core.Output },],
    "camerasNotFound": [{ type: core.Output },],
    "permissionResponse": [{ type: core.Output },],
};
var ZXingScannerModule = /** @class */ (function () {
    function ZXingScannerModule() {
    }
    ZXingScannerModule.forRoot = function () {
        return {
            ngModule: ZXingScannerModule
        };
    };
    return ZXingScannerModule;
}());
ZXingScannerModule.decorators = [
    { type: core.NgModule, args: [{
                imports: [
                    common.CommonModule,
                    forms.FormsModule
                ],
                declarations: [ZXingScannerComponent],
                exports: [ZXingScannerComponent],
            },] },
];
ZXingScannerModule.ctorParameters = function () { return []; };

exports.ZXingScannerModule = ZXingScannerModule;
exports.ɵa = ZXingScannerComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=zxing-ngx-scanner.umd.js.map
