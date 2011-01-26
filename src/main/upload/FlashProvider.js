Ext.ns('Ext.ux.jnap.upload');

/**
 * @class Ext.ux.jnap.upload.FlashProvider
 * @extends Ext.ux.jnap.upload.UploadProvider
 */
Ext.ux.jnap.upload.FlashProvider = Ext.extend(Ext.ux.jnap.upload.UploadProvider, {

	/**
	 * @cfg {String} baseDir
	 */
	baseDir : /*Ext.ux.jnap.util.Defaults.contextPath +*/ 'swfupload/',

	/**
	 * @cfg {String} flashSrc
	 */
	flashSrc : 'swfupload.swf',

	/**
	 * @cfg {String} jsSrc
	 */
	jsSrc : 'swfupload.js',

	/**
	 * @cfg {Boolean} debug
	 */
	debug : false,

	/**
	 * @type String
	 */
	alias : 'flash',

	/**
	 * @type SWFUpload
	 */
	_swfupload : undefined,

	getFeatures : function() {
		return Ext.apply(Ext.ux.jnap.upload.FlashProvider.superclass.getFeatures.call(), {
			chunks : false,
			dnd : false,
			multipart : true,
			progress : true
		});
	},

	init : function(uploader) {
		Ext.ux.jnap.upload.FlashProvider.superclass.init.call(uploader);
		try {
			this._loadScript();
			this._initSWFUpload();
			return true;
		} catch (e) {
			return false;
		}
	},

	// private
	_loadScript : function() {
		if (!SWFObject) {
			var xhr = Ext.ux.jnap.util.ExtUtils.createXhrObject();
			// sync request, it'll block until it's done
			xhr.open('GET', this.baseDir + this.jsSrc, false);
			xhr.send('');
			if (xhr.status == 200 && xhr.reponseText) {
				// insert the script content as a body of the script tag
				Ext.getHead().createChild({
					tag : 'script',
					type : 'text/javascript',
					text : xhr.responseText
				});
			}
			xhr = null;
			delete xhr;
		}
	},

	// private
	_initSWFUpload : function() {
		if (SWFUpload) {
			this._swfupload = new SWFUpload({
				debug : this.debug
			});
		} else {
			throw String.format('[Ext.ux.jnap.upload.FlashProvider] The "SWFUpload" object is not '
				+ 'available. Make sure you have the swfupload script at the right location: "{0}"',
				(this.baseDir + this.jsSrc));
		}
	}

});