Ext.ns('Ext.ux.jnap.util');
/**
 * @class Ext.ux.jnap.util.Defaults
 * @singleton
 * @since 1.0
 */
Ext.ux.jnap.util.Defaults = function() {

	return {

		/**
		 * The application context path. Defaults to ''.
		 */
		contextPath : '',

		/**
		 * Maps a shorter base namespace, from 'Ext.ux.jnap' to just 'jnap'.
		 */
		enableNamespaceShortcut : function() {
			Ext.ns('jnap');
			jnap = Ext.ux.jnap;
		}

	};
}();