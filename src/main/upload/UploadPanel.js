/*!
 * 
 */
Ext.ns('Ext.ux.jnap.upload');

/**
 * @class Ext.ux.jnap.upload.UploadPanel
 * @extends Ext.Panel
 * @see Ext.ux.jnap.upload.Uploader
 * @xtype uploadpanel
 * 
 * @author Daniel Rochetti
 * @since 1.0
 */
Ext.ux.jnap.upload.UploadPanel = Ext.extend(Ext.BoxComponent, {

	browseButtonText : 'Choose files...',

	/**
	 * @cfg {Ext.ux.jnap.upload.Uploader} uploader
	 */
	uploader : undefined

});

// register the component xtype
Ext.reg('uploadpanel', Ext.ux.jnap.upload.UploadPanel);