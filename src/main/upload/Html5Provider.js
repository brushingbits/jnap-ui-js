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

	requestPool : new Ext.util.MixedCollection(),

	/**
	 * @cfg {Object} requestConfig
	 */
	requestConfig : {
		contentTypeHeader : 'text/plain; charset=x-user-defined-binary',
		fileNameHeader : 'X-File-Name',
		fileNameParam : 'fileName'
	},

	init : function(uploader) {
		Ext.ux.jnap.upload.Html5Provider.superclass.init.call(this, uploader);
		var xhr = Ext.ux.jnap.util.ExtUtils.createXhrObject();
		var xhrUploadSupport = !!(xhr.sendAsBinary || xhr.upload);
		xhr = null;
		delete xhr;
		this.createTriggerElement();
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
		var xhrup = new Ext.ux.jnap.upload.Xhr2Upload(Ext.apply(this.requestConfig || {}, {
			url : this.uploader.url
		}));
		var eventAlert = function(event) {
			alert(event.type + ' = ' + event);
		};
		xhrup.on('load', eventAlert.createDelegate(this), this);
		xhrup.on('progress', eventAlert.createDelegate(this), this);
		xhrup.on('progressabort', eventAlert.createDelegate(this), this);
		xhrup.on('error', eventAlert.createDelegate(this), this);
		xhrup.on('loadend', eventAlert.createDelegate(this), this);
		this.requestPool.add(file.getId(), xhrup);
		xhrup.upload(file.nativeRef);
	},

	onCancel : function(file) {
		var reqpool = this.requestPool;
		var fileId = file.getId();
		if (reqpool.containsKey(fileId)) {
			var xhr = reqpool.get(fileId);
			xhr.abort();
			reqpool.removeKey(fileId);
			xhr = null;
			delete xhr;
		}
	},

	createTriggerElement : function() {
		var el = this.uploader.browseFilesTriggerEl;
		var wrap = this._fileInputWrap = el.wrap({
			cls : 'x-form-field-wrap ' + this.uploader.baseCls + '-wrap'
		});
		var input = this._fileInput = wrap.createChild({
			tag : 'input',
			type : 'file',
			cls : this.uploader.baseCls + '-input-file',
			multiple : !!this.uploader.multiple,
			size : 1
		});
		input.setOpacity(0);
		input.on({
			scope : this,
			'change' : function(evt, inputFile) {
				var files = inputFile.files || [];
				for (var i = 0; i < files.length; i++) {
					this.uploader.queue.addFile(this.toUploadFile(files[i]));
				}
			},
			'mouseenter' : function() {
				//this.uploader.browseFilesTriggerEl.fireEvent();
			},
			'mouseleave' : function() {
				//alert('mouse leave!');
			}
		});
		//this._doTriggerLayout();
		//el.on('');
	},

	toUploadFile : function(nativeFile) {
		return new Ext.ux.jnap.upload.UploadFile(Ext.id(nativeFile.name),
			nativeFile.name, nativeFile.fileSize || nativeFile.size, nativeFile);
	},

	_doTriggerLayout : function() {
		var el = this.uploader.browseFilesTriggerEl;
		this._fileInput.setHeight(el.getHeight());
		this._fileInput.setWidth(el.getWidth());
		this._fileInputWrap.setHeight(el.getHeight());
		this._fileInputWrap.setWidth(el.getWidth());
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

	url : 'upload/',

	fileReader : undefined,

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

	abort : function() {
		this.xhr.abort();
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
		this.fileReader = new FileReader();
		this.fileReader.addEventListener('load', this._sendEncodedFile.createDelegate(this), false);
		this.fileReader.readAsBinaryString(this.file);
		return true;
	},

	// protected
	_sendEncodedFile : function() {
		var lf = '\r\n',
			boundary = 'html5-upload-' + new Date().getTime(),
			data = '';

		data += String.format('--{0}{1}Content-Disposition: form-data; name="{2}"; filename="{3}"{1}'
			+ 'Content-Type:{4}{1}Content-Transfer-Encoding: base64{1}{1}{5}{1}--{0}--{1}{1}',
			boundary, lf, this.fileNameParam, this.file.name,
			this.file.type, window.btoa(this.fileReader.result));

		this.xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
		this.xhr.send(data);
	},

	// private
	_delegateEvent : function(event) {
		this.fireEvent(event.type, event);
	}

});