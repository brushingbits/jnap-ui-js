/*!
 * 
 */
Ext.ns('Ext.ux.jnap.upload');

/**
 * @class Ext.ux.jnap.upload.Uploader
 * @extends Ext.util.Observable
 * @author Daniel Rochetti
 * @since 1.0
 * 
 * @constructor
 * Creates a new Uploader.
 * @param {Object} config A config object containing the objects needed for the Uploader to handle
 * the file upload logic.
 */
Ext.ux.jnap.upload.Uploader = Ext.extend(Ext.util.Observable, {

	/**
	 * @property
	 * @type Number
	 * @static
	 */
	ERROR_FORBIDEN_EXTENSION : 1,
	
	/**
	 * @property
	 * @type Number
	 * @static
	 */
	ERROR_SIZE_NOT_ALLOWED : 2,

	/**
	 * @cfg {Array|Ext.ux.jnap.upload.UploadProvider} providers
	 */
	providers : undefined,

	/**
	 * @cfg {Boolean} async
	 */
	async : true,

	/**
	 * @cfg {Number} batchSize
	 */
	batchSize : 2,

	/**
	 * @cfg {Boolean} multiple
	 */
	multiple : true,

	/**
	 * @cfg {Number} maxQueueSize
	 * The max number of files that the queue can handle. Defaults to <code>0</code> (unlimited).
	 */
	maxQueueSize : 0,

	/**
	 * 
	 */
	requiredFeatures : [],

	/**
	 * @cfg {String} url (required)
	 */
	url : undefined,

	lang : {
		unknownFileSize: 'Unknown'
	},

	constructor : function(config) {
		var _me = this; // this instance alias
		Ext.apply(_me, config || {});
		var _ns = Ext.ux.jnap.upload; // this class namespace alias
		_me.addEvents(
			/**
			 * @event dialogclose
			 */
			'dialogclose',
			/**
			 * @event dialogopen
			 */
			'dialogopen',
			/**
			 * @event exception
			 * Fires if an exception occurs in the Uploader
			 * @param {Uploader} this
			 * @param {Number} errorCode
			 */
			'exception',
			/**
			 * @event filesadded
			 * Fires when one or more files are added to the upload queue.
			 * @param {Uploader} this The Uploader reference.
			 * @param {UploadQueue} queue The UploadQueue
			 * @param {UploadFile[]} files Files that were added to the queue.
			 */
			'filesadded',
			/**
			 * @event filesremoved
			 * Fires when one or more files are removed from the upload queue.
			 * @param {Uploader} this
			 * @param {UploadQueue} queue
			 * @param {UploadFile[]} files
			 */
			'filesremoved',
			/**
			 * @event initerror
			 */
			'initerror',
			/**
			 * @event initsuccess
			 */
			'initsuccess',
			/**
			 * @event uploadcancel
			 */
			'uploadcancel',
			/**
			 * @event uploadcomplete
			 */
			'uploadcomplete',
			/**
			 * @event uploaderror
			 */
			'uploaderror',
			/**
			 * @event uploadprogress
			 */
			'uploadprogress',
			/**
			 * @event uploadstart
			 */
			'uploadstart',
			/**
			 * @event uploadsuccess
			 */
			'uploadsuccess'
		);
		_me.providers = _me.providers ||
				[new _ns.Html5Provider(),
				 new _ns.FlashProvider(),
				 new _ns.StandardProvider()];
		var currentProvider = null;
		for (var i = 0; i < _me.providers.length; i++) {
			currentProvider = _me.providers[i];
			var initialized = currentProvider.init(_me);
			if (initialized) {
				var providerFeatures = currentProvider.getFeatures();
				var supportedFeatures = Ext.partition(_me.requiredFeatures || [], function(feat) {
					return providerFeatures[feat];
				});
				// are there any required feature missing? 
				if (supportedFeatures[1].length === 0) {
					_me.activeProvider = currentProvider;
					break;
				}
			}
		}
		// validate state
		if (!_me.activeProvider) {
			_me.fireEvent('initerror', _me);
		} else {
			_me.queue = new _ns.UploadQueue(_me);
			_me.fireEvent('initsuccess', _me, _me.activeProvider);
		}
	},

	/**
	 * @type Ext.ux.jnap.upload.UploadProvider
	 * The {@link Ext.ux.jnap.upload.UploadProvider} that was successfully initialized.
	 * This is a read-only 'protected' property and must not be overwritten.
	 */
	activeProvider : undefined,

	/**
	 * @type Ext.ux.jnap.upload.UploadQueue
	 */
	queue : undefined,

	/**
	 * Generates an unique ID for a file in the current Uploader queue.
	 * @return {String} unique ID for a file.
	 */
	generateId : function() {
		
	},

	openFileDialog : function() {
		this.activeProvider.openFileDialog();
	},

	/**
	 * @method start
	 */
	start: function() {
		this.activeProvider.start();
	},

	/**
	 * @method stop
	 */
	stop: function(fileId) {
		this.activeProvider.stop(fileId);
	},

	/**
	 * @method cancel
	 */
	cancel: function(fileId) {
		this.activeProvider.cancel(fileId);
	}
});

Ext.ux.jnap.upload.UploadStatus = {

	/**
	 * @type Number
	 */
	QUEUED : 1,

	/**
	 * @type Number
	 */
	UPLOADING : 2,

	/**
	 * @type Number
	 */
	FAILED : 3,

	/**
	 * @type Number
	 */
	DONE : 4,

	/**
	 * @type Number
	 */
	CANCELLED : 5
};

/**
 * @class Ext.ux.jnap.upload.UploadQueue
 * @extends Object
 * 
 * @constructor
 * Creates a new queue.
 * @param {Ext.ux.jnap.upload.Uploader} uploader
 */
Ext.ux.jnap.upload.UploadQueue = Ext.extend(Object, {

	constructor : function(uploader) {
		Ext.ux.jnap.upload.UploadQueue.superclass.constructor.call();
		this.uploader = uploader;
		this.files = new Ext.util.MixedCollection(false, function(file) {
			return file.getId();
		});
	},

	/**
	 * @property
	 */
	files : new Ext.util.MixedCollection(),

	/**
	 * @property
	 */
	uploader : undefined,

	/**
	 * @method addFile
	 * @param {Ext.ux.jnap.upload.UploadFile} file
	 */
	addFile : function(file) {
		var _me = this;
		if (_me.uploader.fireEvent('fileadded', _me.uploader, _me, file) !== false) {
			_me.files.add(file);
			_me.uploader.fireEvent('queuechanged', _me.uploader, _me);
		}
	},

	/**
	 * @method removeFile
	 * @param {UploadFile} file
	 */
	removeFile : function(file) {
		var _me = this;
		if (_me.uploader.fireEvent('fileremoved', _me.uploader, _me, file) !== false) {
			_me.files.remove(file);
			_me.uploader.fireEvent('queuechanged', _me.uploader, _me);
		}
	},

	/**
	 * @method clear
	 */
	clear : function() {
		var _me = this;
		var allFiles = _me.files;
		allFiles.each(function(file, i, length) {
			_me.removeFile(file);
		});
	},

	/**
	 * @method isEmpty
	 * @return 
	 */
	isEmpty : function() {
		return !this.files || this.files.getCount() == 0;
	},

	/**
	 * @method getFile
	 * @param {String} id File id
	 * @return {Ext.ux.jnap.upload.UploadFile} Gets a reference to the {@link Ext.ux.jnap.upload.UploadFile}
	 * with the provided id. If there is no file with such id returns <tt>undefined</tt>.
	 */
	getFile : function(id) {
		return this.file.get(id);
	},

	getTotalSize : function() {
		var totalSize = 0;
		this.files.each(function(file, i, length) {
			totalSize += file.getSize();
		});
		return totalSize;
	},

	getFormattedTotalSize : function() {
		return Ext.util.Format.fileSize(this.getTotalSize());
	},

	/**
	 * @method isDone
	 * @return {Boolean}
	 */
	isDone : function() {
		var result = this.files.find(function(file) {
			return file.getState() != Ext.ux.jnap.upload.UploadStatus.DONE;
		});
		return result == null;
	},

	/**
	 * @method hasErrors
	 * @return {Boolean}
	 */
	hasErrors : function() {
		var result = Ext.partition(this.files, function(file) {
			return file.getState() === Ext.ux.jnap.upload.UploadStatus.FAILED;
		});
		return result[0].length > 0;
	},

	/**
	 * @method isUploading
	 * @return {Boolean}
	 */
	isUploading : function() {
		var result = Ext.partition(this.files, function(file) {
			return file.getState() === Ext.ux.jnap.upload.UploadStatus.UPLOADING;
		});
		return result[0].length > 0;
	},

	/**
	 * @method isPending
	 * @return {Boolean}
	 */
	isPending : function() {
		var result = Ext.partition(this.files, function(file) {
			return file.getState() === Ext.ux.jnap.upload.UploadStatus.QUEUED;
		});
		return result[0].length > 0;
	}
});

/**
 * @class Ext.ux.jnap.upload.UploadFile
 * @extends Object
 */
Ext.ux.jnap.upload.UploadFile = Ext.extend(Object, {

	ref : undefined,

	constructor : function(id, name, size, ref) {
		this.id = id;
		this.name = name;
		this.size = size;
		this.state = Ext.ux.jnap.upload.UploadStatus.QUEUED;
		this.ref = ref;
	},

	/**
	 * @method getId
	 * @return {String}
	 */
	getId : function() {
		return this.id;
	},

	/**
	 * @method getName
	 * @return {String} name of the file
	 */
	getName : function() {
		return this.name;
	},

	/**
	 * @method getExtension
	 * @return {String}
	 */
	getExtension : function() {
		var nm = this.name;
		var extension = undefined;
		if (nm && nm.lastIndexOf('.') != -1) {
			extension = nm.substring(nm.lastIndexOf('.'));
		}
		return extension;
	},

	/**
	 * @method getSize
	 * @return {Number}
	 */
	getSize : function() {
		return this.size;
	},

	/**
	 * @method getFormattedSize
	 * @return {String}
	 */
	getFormattedSize : function() {
		return this.size ? Ext.util.Format.fileSize(this.size) : 'Unknown';
	},

	/**
	 * @method getFormattedSize
	 * @return {Number}
	 */
	getState : function() {
		return this.state;
	},

	/**
	 * @method getFormattedSize
	 * @return {Number}
	 */
	setState : function(state) {
		this.state = state;
	}
});