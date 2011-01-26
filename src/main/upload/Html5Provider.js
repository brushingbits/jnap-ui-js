/**
 * @class Ext.ux.jnap.upload.Html5Provider
 * @extends Ext.ux.jnap.upload.UploadProvider
 */
Ext.ux.jnap.upload.Html5Provider = Ext.extend(Ext.ux.jnap.upload.UploadProvider, {

	alias : 'html5',

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
	}

});