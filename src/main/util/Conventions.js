Ext.ns('Ext.ux.jnap.util');
/**
 * @class Ext.ux.jnap.util.Defaults
 * @singleton
 * @since 1.0
 */
Ext.ux.jnap.util.Conventions = function() {

	return {

		/**
		 * <code>true</code> to auto apply conventions at lib load time.
		 */
		autoApply : true,

		/**
		 * Maps a shorter base namespace, from 'Ext.ux.jnap' to just 'jnap'.
		 */
		enableNamespaceShortcut : function() {
			Ext.ns('jnap');
			jnap = Ext.ux.jnap;
		},

		setDefaultDataProperties : function() {
			Ext.data.JsonReader.prototype.root = 'modelList';
			Ext.data.JsonReader.prototype.id = 'id';
			Ext.data.JsonReader.prototype.restful = true;
		},

		DEFAULT_PAGE_SIZE : 15,

		doAutoLoadWithPaging : function() {
			return { start : 0, limit : Ext.ux.jnap.util.Conventions.DEFAULT_PAGE_SIZE };
		},

		setDefaultPagingConfig : function(pageSize) {
			Ext.PagingToolbar.prototype.pageSize = pageSize;
			Ext.data.JsonReader.prototype.totalProperty = 'pagingData["totalResults"]';
		},

		setDefaultFormConventions : function() {
			Ext.form.ComboBox.prototype.queryParam = 'searchQuery';
		},

		applyAll : function() {
			jnapconv.enableNamespaceShortcut();
			jnapconv.setDefaultDataProperties();
			jnapconv.setDefaultPagingConfig(jnapconv.DEFAULT_PAGE_SIZE);
			Ext.ux.jnap.NotificationMgr.registerDefaultLoadingMsgOnAjax();
		}

	};
}();

jnapconv = Ext.ux.jnap.util.Conventions;