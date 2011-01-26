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
Ext.ux.jnap.upload.UploadPanel = Ext.extend(Ext.Panel, {

	/**
	 * @cfg {Uploader} uploader
	 */
	uploader: undefined,

	// protected
	initComponent: function(){
		Ext.ux.jnap.upload.UploadPanel.superclass.initComponent.call(this);
		if (!this.uploader) {
			this.uploader = new Ext.ux.jnap.upload.Uploader();
		}
	},

	tbar: {
		
	},

	items: [
		new Ext.grid.GridPanel()
	]
});

// register the component xtype
Ext.reg('uploadpanel', Ext.ux.jnap.upload.UploadPanel);