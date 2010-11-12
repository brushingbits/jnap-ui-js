/**
 * @class Ext.ux.jnap.form.FormUtils
 * @extends Object
 * @singleton
 * <p>A singleton class that contains form utilities, mainly a generic function for form submitting
 * that handle RESTful methods (PUT, DELETE) using a hidden field ({@link #restfulMethodParamName})
 * and automaticaly result and message handling (using {@link Ext.ux.jnap.NotificationMessage}).</p>
 * <p>More details can be found on each method documentation.</p>
 */
Ext.ux.jnap.form.FormUtils = function() {

	var _getErrorMsg = function(response) {
		var msg = undefined;
		switch (response.failureType) {
		case Ext.form.Action.CLIENT_INVALID:
			msg = {
				type : 'warning',
				msg : Ext.ux.jnap.form.FormUtils.defaultInvalidMsg
			};
			break;
		case Ext.form.Action.CONNECT_FAILURE:
			msg = {
				type : 'error',
				msg : Ext.ux.jnap.form.FormUtils.defaultErrorMsg
			};
			break;
		default:
			msg = {
				type : 'error',
				msg : response.result.msg
			};
		}
	};

	return {

		defaultSuccessMsg : 'Your data has been successfully submitted.',

		defaultInvalidMsg : 'Your form contains invalid data, correct it and try again.',

		defaultErrorMsg : 'There was a server communication error while processing your form.',

		defaultResetOnSuccess : false,

		defaultClearOnSuccess : false,

		restfulMethodParamName : '_method',

		formMessageDefaults : {
			closeable : true,
			dismissDelay : 5000,
			destroyOnHide : true
		},

		/**
		 * 
		 * @param src
		 * @param evt
		 * @return
		 */
		submit : function(src, evt, opts) {
			opts = opts || {};
			Ext.applyIf(opts, {
				successMsg : Ext.ux.jnap.form.FormUtils.defaultSuccessMsg,
				invalidMsg : Ext.ux.jnap.form.FormUtils.defaultInvalidMsg,
				errorMsg : _getErrorMsg,
				resetOnSuccess : Ext.ux.jnap.form.FormUtils.defaultResetOnSuccess,
				clearOnSuccess : Ext.ux.jnap.form.FormUtils.defaultClearOnSuccess,
				onSuccess : Ext.emptyFn,
				onError : Ext.emptyFn,
				method: 'POST'
			});
			var formPanel = opts.form || src.findParentByType(Ext.form.FormPanel);
			if (!formPanel) {
				throw String.format('[FormUtils.submit] The button {0} is not inside a form.', src.id);
			}
			var form = formPanel.getForm();
			if (form.isValid()) {
				var formMethod = form.method || opts.method;
				formMethod = formMethod.toUpperCase();
				if (form.method != 'GET') {
					if (formMethod != 'POST') {
						formPanel.add({
							xtype : 'hidden',
							name : Ext.ux.jnap.form.FormUtils.restfulMethodParamName,
							value : formMethod
						});
					}
				}
				form.submit({
					url : opts.url || form.url || formPanel.url,
					method : formMethod,
					success : function(form, response) {
						opts.onSuccess.call(form, response);
						if (opts.resetOnSuccess) {
							form.reset();
						}
						if (opts.clearOnSuccess) {
							// TODO clear all fields
						}
						Ext.ux.jnap.form.FormUtils.showMessage(formPanel, opts.successMsg);
					},
					failure : function(form, response) {
						opts.onError.call(form, response);
						var errorMsg = Ext.isFunction(opts.errorMsg)
								? opts.errorMsg.call(response)
								: opts.errorMsg;
						Ext.ux.jnap.form.FormUtils.showMessage(formPanel, errorMsg);
					}
				});
			} else {
				Ext.ux.jnap.form.FormUtils.showMessage(formPanel, {
					msg : Ext.ux.jnap.form.FormUtils.defaultInvalidMsg,
					type : 'warning'
				});
				// focus first invalid field
				var invalidFields = formPanel.findBy(function(item) {
					return item.isFormField && item.isValid && !item.isValid(false);
				});
				invalidFields[0].focus();
			}
		},

		/**
		 * 
		 * @param formPanel
		 * @param msg
		 */
		showMessage : function(formPanel, msg) {
			Ext.applyIf(msg, Ext.ux.jnap.form.FormUtils.formMessageDefaults);

			// does the panel or any parent has the NotificationMessage plugin installed?
			var notificationMsgPanel = formPanel.showNotificationMsg ? formPanel : undefined;
			if (!notificationMsgPanel) {
				var notificationMsgPanel = formPanel.findParentBy(function(container, component) {
					return container.showNotificationMsg != undefined;
				});
			}

			// did we find a container with the NotificationMessage plugin installed?
			if (notificationMsgPanel) {
				notificationMsgPanel.showNotificationMsg(msg);
			} else {
				// if not, let's look for (or add a new) a container for the messages
				var formMsgId = formPanel.getId() + '-messages';
				var msgContainer = Ext.get(formMsgId) || Ext.getCmp(formMsgId);
				if (!msgContainer) {
					formPanel.insert(0, new Ext.BoxComponent({
						id : formMsgId
					}));
					formPanel.doLayout();
				}
				var notificationMsg = new Ext.ux.jnap.NotificationMessage(msg);
				notificationMsg.render(formMsgId);
				// TODO how to put this inside the NotificationMessage class? top parent container doLayout?
				/*notificationMsg.mon(notificationMsg, 'hide', function() {
					this.doLayout();
				}, formPanel);*/
			}
		}

	};
}();