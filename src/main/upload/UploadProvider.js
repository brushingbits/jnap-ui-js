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

	browseTrigger : undefined,

	constructor : function(config) {
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

	addFiles : function(files) {
		
	},

	onAddFiles : function(files) {
		
	},

	upload : function(file) {
		if (this.uploader.fireEvent('beforeuploadstart', file) !== false) {
			this.onUpload.call(this, file);
		}
	},

	// protected 'abstract', must implement on subclass
	onUpload : function(file) {
	}

});