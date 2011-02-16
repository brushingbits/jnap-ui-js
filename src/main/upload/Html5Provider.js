/**
 * @class Ext.ux.jnap.upload.Html5Provider
 * @extends Ext.ux.jnap.upload.UploadProvider
 */
Ext.ux.jnap.upload.Html5Provider = Ext.extend(Ext.ux.jnap.upload.UploadProvider, {

	/**
	 * @cfg {String} alias
	 * The alias for this provider is 'html5' and should not be changed.
	 */
	alias : 'html5',

	dropElement : undefined,

	/**
	 * @cfg {Object} requestConfig
	 */
	requestConfig : {
		contentTypeHeader : 'text/plain; charset=x-user-defined-binary',
		fileNameHeader : 'X-File-Name',
		fileNameParam : 'fileName'
	},

	init : function() {
		Ext.ux.jnap.upload.Html5Provider.superclass.init.call(uploader);
		var xhr = Ext.ux.jnap.util.ExtUtils.createXhrObject();
		var xhrUploadSupport = !!(xhr.sendAsBinary || xhr.upload);
		xhr = null;
		delete xhr;
		return xhrUploadSupport;
	},

	getFeatures : function() {
		if (!this._features) {
			this._features = Ext.ux.jnap.upload.Html5Provider.superclass.getFeatures.call();
			var xhr = Ext.ux.jnap.util.ExtUtils.createXhrObject();
			var hasFileApiSupport = !!File;

			Ext.apply(this._features, {
				chunks : false, // TODO chunk support in html5?
				dnd : !!(hasFileApiSupport && File.prototype.slice) || window.mozInnerScreenX !== undefined,
				multipart : !!(hasFileApiSupport && File.prototype.getAsDataURL),
				progress : !!xhr.upload
			});

			// delete temp xhr object
			xhr = null;
			delete xhr;
		}
		return this._features;
	},

	onUpload : function(file) {
		var xhr = new Ext.ux.jnap.upload.Xhr2Upload(this.requestConfig || {});
		
	}

});

Ext.ux.jnap.upload.Xhr2Upload = Ext.extend(Ext.util.Observable, {

	/**
	 * @cfg {String} contentTypeHeader
	 */
	contentTypeHeader : 'text/plain; charset=x-user-defined-binary',

	/**
	 * @cfg {String} fileNameHeader
	 */
	fileNameHeader : 'X-File-Name',

	/**
	 * @cfg {String} fileNameParam
	 */
	fileNameParam : 'fileName',

	/**
	 * @cfg {Boolean}
	 */
	sendMultiPartFormData : false,

	xhr : undefined,

	constructor : function(config) {
		Ext.apply(this, config || {});
		this.addEvents(
			/**
			 * @event load
			 */
			'load',
			/**
			 * @event loadstart
			 */
			'loadstart',
			/**
			 * @event loadend
			 */
			'loadend',
			'loaderror',
			'uploadprogress',
			'uploadabort');
	},

	upload : function(file) {
		this.xhr = Ext.ux.jnap.util.ExtUtils.createXhrObject();
		this.xhr.open('post', this.url, true);
		this.file = file;
		return this[Ext.isDefined(FileReader) ? '_sendFileUsingReader' : '_sendBinary'].call(this);
	},

	_bindRequestEvents : function() {
		var allEvents = ['progress', 'progressabort', 'error', 'load', 'loadend'];
		Ext.each(allEvents, function(eventName, index, eventsArray) {
			this.xhr.addEventListener(eventName, this._delegateEvent.createDelegate(this), false);
		}, this);
	},

	_sendBinary : function() {
		this.xhr.overrideMimeType(this.contentTypeHeader);
		this.xhr.setRequestHeader(this.fileNameHeader, this.file.name);
		this.xhr.send(this.file);
		return true;
	},

	// protected
	_sendFileUsingReader : function() {
		this.reader = new FileReader();
		this.reader.addEventListener('load', this._sendEncodedFile.createDelegate(this), false);
		this.reader.readAsBinaryString(this.file);
		return true;
	},

	// protected
	_sendEncodedFile : function() {
		var lf = '\n\r',
			boundary = 'html5-upload-' + new Date().getTime(),
			data = '';

		data += String.format('--{0}{1}Content-Disposition: form-data; name="{2}"; filename="{3}"{1}'
			+ 'Content-Type:{4}{1}"Content-Transfer-Encoding: base64{1}{1}{5}{1}--{0}--{1}{1}',
			boundary, lf, this.fileNameParam, this.file.name,
			this.file.type, window.btoa(this.reader.result));
	},

	// private
	_delegateEvent : function(event) {
		this.fireEvent(event.type, event);
	}

});