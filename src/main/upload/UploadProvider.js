/*!
 * 
 */
Ext.ns('Ext.ux.jnap.upload');

/**
 * @class Ext.ux.jnap.upload.UploadProvider
 * @extends Ext.util.Observable
 * 
 * Ext.ux.jnap.upload.UploadProvider is an abstract base class which is intended
 * to be extended and should not be created directly. For out-of-the-box implementations,
 * see {@link Ext.ux.jnap.upload.Html5Provider} and {@link Ext.ux.jnap.upload.FlashProvider}.
 * 
 * @constructor Creates a new UploadProvider.
 * @param {Object} config A config object containing the objects needed to configure the provider.
 */
Ext.ux.jnap.upload.UploadProvider = Ext.extend(Ext.util.Observable, {

	/**
	 * @cfg {String} alias
	 */
	alias : undefined,

	uploader : undefined,

	constructor : function(config) {
		Ext.apply(this, config || {});
		this.addEvents(
			/**
			 * @event initsuccess
			 */
			'initsuccess',
			/**
			 * @event initerror
			 */
			'initerror'
		);
	},

	init : function(uploader) {
		this.uploader = uploader;
	},

	/**
	 * @return {Object}
	 */
	getFeatures : function() {
		return {
			chunks : false,
			dnd : false,
			multipart : false,
			progress : false
		};
	},

	/**
	 * 
	 * @param {Ext.ux.jnap.upload.UploadFile} file
	 */
	upload : function(file) {
		if (file.getStatus() == Ext.ux.jnap.upload.UploadStatus.QUEUED
				&& this.uploader.fireEvent('beforeuploadstart', file) !== false) {
			file.setStatus(Ext.ux.jnap.upload.UploadStatus.UPLOADING);
			this.uploader.fireEvent('uploadstart', this.uploader, this, file);
			this.onUpload.call(this, file);
		}
	},

	/**
	 * 
	 * @param {Ext.ux.jnap.upload.UploadFile} file
	 */
	cancel : function(file) {
		if (this.uploader.fireEvent('beforeuploadcancel', file) !== false) {
			if (Ext.ux.jnap.upload.UploadStatus.UPLOADING == file.getStatus()) {
				this.onCancel.call(this, file);
			}
			file.setStatus(Ext.ux.jnap.upload.UploadStatus.CANCELLED);
			this.uploader.fireEvent('uploadcancel', this.uploader, this, file);
			this.uploader.fireEvent('uploadfinish', this.uploader, this, file, 299, null);
		}
	},

	// protected 'abstract', must implement on subclass
	onCancel : function(file) {
	},

	// protected 'abstract', must implement on subclass
	onUpload : function(file) {
	},

	// protected 'abstract', must implement on subclass
	toUploadFile : function(nativeFile) {
	}

});