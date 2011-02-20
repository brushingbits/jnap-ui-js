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
		var xhrUploadSupport = !!(xhr.upload || xhr.sendAsBinary);
		if (xhrUploadSupport) {
			this._loadFeatures(xhr);
			if (this.uploader.dropContainerEl && this.getFeatures().dnd) {
				this._configDropContainer();
			}
		}
		xhr = null;
		delete xhr;
		this._createInputOverlay.defer(100, this);
		return xhrUploadSupport;
	},

	getFeatures : function() {
		return this._features;
	},

	_loadFeatures : function(xhr) {
		var hasFileApiSupport = !!File;

		this._features = Ext.ux.jnap.upload.Html5Provider.superclass.getFeatures.call(this);
		Ext.apply(this._features, {
			chunks : false,
			dnd : !!(hasFileApiSupport && File.prototype.slice) || window.mozInnerScreenX !== undefined,
			multipart : !!(hasFileApiSupport && File.prototype.getAsDataURL),
			progress : !!xhr.upload
		});		
	},

	onUpload : function(file) {
		var xhrup = new Ext.ux.jnap.upload.Xhr2Upload(Ext.apply(this.requestConfig || {}, {
			url : this.uploader.url
		}));
		xhrup.on('uploadprogress', function(event) {
			this.uploader.fireEvent('uploadprogress', this.uploader, this, file,
				event.loaded, (event.loaded / event.total), event.total);
		}, this);
		xhrup.on('load', function(event) {
			var xhr = xhrup.xhr;
			var status = xhr.status;
			var response = xhr.responseText || xhr.responseXml;
			if (status >= 200 && status < 300) {
				this.uploader.fireEvent('uploadsuccess', this.uploader, this, file, response);
			} else {
				this.uploader.fireEvent('uploaderror', this.uploader, this, file, response);
			}
			// TODO clean requests
			/*var req = this.requestPool.removeKey(file.getId());
			req = null;
			delete req;*/
			this.uploader.fireEvent('uploadfinish', this.uploader, this, file, status, response);
		}, this);
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

	toUploadFile : function(nativeFile) {
		return new Ext.ux.jnap.upload.UploadFile(Ext.id(nativeFile.name),
			nativeFile.name, nativeFile.fileSize || nativeFile.size, nativeFile);
	},

	_createInputOverlay : function() {
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
				this._addSelectedFiles(inputFile.files || []);
			},
			'mouseenter' : function(event, el, opt) {
				this.uploader.fireEvent('browsefilesover', event, el);
			},
			'mouseleave' : function(event, el, opt) {
				this.uploader.fireEvent('browsefilesout', event, el);
			},
			'click' : function(event, el, opt) {
				this.uploader.fireEvent('browsefilesclick', event, el);
			}
		});
	},

	_addSelectedFiles : function(files) {
		for (var i = 0; i < files.length; i++) {
			this.uploader.queue.addFile(this.toUploadFile(files[i]));
		}
	},

	_resizeDropContainer : function(parent) {
		var m = this.dropElement.getMargins();
		this.dropElement.setSize(parent.getWidth() - (m.left + m.right),
			parent.getHeight() - (m.top + m.bottom));
	},

	_configDropContainer : function() {
		var dropContainer = Ext.get(this.uploader.dropContainerEl);
		var drop = this.dropElement = dropContainer.createChild({
			cls : this.uploader.baseCls + '-drop-container',
			html : String.format('<p>{0}</p>', this.uploader.dropHintText)
		});
		drop.setVisibilityMode(Ext.Element.VISIBILITY);
		this._resizeDropContainer(dropContainer);
		dropContainer.on('resize', function(event, el, obj) {
			this._resizeDropContainer(Ext.get(el));
		}, this);
		var body = Ext.getBody();
		body.on('dragenter', function(event) {
			this.dropElement.setVisible(true);
		}, this);
		body.on('dragleave', function(event) {
			this.dropElement.setVisible(false);
		}, this);
		drop.on('dragover', function(event) {
			event.browserEvent.dataTransfer.dropEffect = 'move';
			event.preventDefault();
		}, this);
		drop.on('drop', function(event) {
			event.preventDefault();
			this._addSelectedFiles(event.browserEvent.dataTransfer.files || []);
			this.dropElement.setVisible(false);
		}, this);
	}

});

/**
 * 
 * @class Ext.ux.jnap.upload.Xhr2Upload
 * @extends Ext.util.Observable
 */
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
			'load',
			'loadstart',
			'loadend',
			'error',
			'progress',
			'progressabort');
	},

	upload : function(file) {
		this.xhr = Ext.ux.jnap.util.ExtUtils.createXhrObject();
		this._bindEvents();
		this.xhr.open('post', this.url, true);
		this.file = file;
		return this[Ext.isDefined(FileReader) ? '_sendFileUsingReader' : '_sendBinary'].call(this);
	},

	abort : function() {
		this.xhr.abort();
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
		this.fileReader.readAsBinaryString(this.file);
		this.fileReader['onload'] = this._sendMultipartRequest.createDelegate(this);
		return true;
	},

	// protected
	_sendMultipartRequest : function() {
		var lf = '\r\n',
			boundary = 'jnap-ui-html5-upload-' + new Date().getTime(),
			blob = '';

		// The RFC2388 blob (http://www.ietf.org/rfc/rfc2388.txt)
		blob += String.format('--{0}{1}Content-Disposition: form-data; name="{2}"; filename="{3}"{1}'
			+ 'Content-Type:{4}{1}Content-Transfer-Encoding: base64{1}{1}{5}{1}--{0}--{1}{1}',
			boundary, lf, this.fileNameParam, this.file.name,
			this.file.type, window.btoa(this.fileReader.result));

		this.xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
		this.xhr.send(blob);
//		this.xhr.sendAsBinary ? this.xhr.sendAsBinary(blob) : this.xhr.send(blob);
	},

	_readBinaryFile : function() {
		return this.file.getAsBinary ? this.file.getAsBinary() : window.btoa(this.fileReader.result);
	},

	_bindEvents : function() {
		Ext.each(['loadstart', 'load', 'loadend', 'progress', 'progressabort', 'error'],
			function(eventName, index, events) {
				this.xhr.addEventListener(eventName, this._delegateEvent.createDelegate(this), false);
				this.xhr.upload.addEventListener(eventName, this._delegateUploadEvent.createDelegate(this), false);
		}, this);
	},

	// private
	_delegateEvent : function(event) {
		this.fireEvent(event.type, event);
	},

	// private
	_delegateUploadEvent : function(event) {
		this.fireEvent('upload' + event.type, event);
	}

});