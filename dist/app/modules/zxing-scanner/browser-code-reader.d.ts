import { Reader, BinaryBitmap, Result } from '@zxing/library';
/**
 * Based on zxing-typescript BrowserCodeReader
 */
export declare class BrowserCodeReader {
    private reader;
    private timeBetweenScans;
    /**
     * The HTML video element, used to display the camera stream.
     */
    private videoElement;
    /**
     * Should contain the actual registered listener for video play-ended,
     * used to unregister that listener when needed.
     */
    private videoPlayEndedEventListener;
    /**
     * Should contain the actual registered listener for video playing,
     * used to unregister that listener when needed.
     */
    private videoPlayingEventListener;
    /**
     * Should contain the actual registered listener for video loaded-metadata,
     * used to unregister that listener when needed.
     */
    private videoLoadedMetadataEventListener;
    /**
     * The HTML image element, used as a fallback for the video element when decoding.
     */
    private imageElement;
    /**
     * Should contain the actual registered listener for image loading,
     * used to unregister that listener when needed.
     */
    private imageLoadedEventListener;
    /**
     * The HTML canvas element, used to draw the video or image's frame for decoding.
     */
    private canvasElement;
    /**
     * The HTML canvas element context.
     */
    private canvasElementContext;
    /**
     * The continuous scan timeout Id.
     */
    private timeoutHandler;
    /**
     * The stream output from camera.
     */
    private stream;
    /**
     * Constructor for dependency injection.
     *
     * @param reader The barcode reader to be used to decode the stream.
     * @param timeBetweenScans The scan throttling in milliseconds.
     */
    constructor(reader: Reader, timeBetweenScans?: number);
    /**
     * Starts the decoding from the actual or a new video element.
     *
     * @param callbackFn The callback to be executed after every scan attempt
     * @param deviceId The device's to be used Id
     * @param videoElement A new video element
     */
    decodeFromInputVideoDevice(callbackFn: (result: Result) => any, deviceId?: string, videoElement?: HTMLVideoElement): void;
    /**
     * Sets the new stream and request a new decoding-with-delay.
     *
     * @param stream The stream to be shown in the video element.
     * @param callbackFn A callback for the decode method.
     */
    private startDecodeFromStream(stream, callbackFn);
    /**
     * Sets a HTMLVideoElement for scanning or creates a new one.
     *
     * @param videoElement The HTMLVideoElement to be set.
     */
    private prepareVideoElement(videoElement?);
    /**
     *
     * @param callbackFn
     */
    private decodeWithDelay(callbackFn);
    /**
     * Does the real image decoding job.
     *
     * @param callbackFn
     * @param retryIfNotFound
     * @param retryIfChecksumOrFormatError
     * @param once
     */
    private decode(callbackFn, retryIfNotFound?, retryIfChecksumOrFormatError?, once?);
    /**
     * Alias for this.reader.decode
     *
     * @param binaryBitmap
     */
    protected readerDecode(binaryBitmap: BinaryBitmap): Result;
    /**
     * 🖌 Prepares the canvas for capture and scan frames.
     */
    private prepareCaptureCanvas();
    /**
     * Stops the continuous scan and cleans the stream.
     */
    private stop();
    /**
     * Resets the scanner and it's configurations.
     */
    reset(): void;
}
