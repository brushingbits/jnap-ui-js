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
				msg : response.result.msg,
				dismissDelay : 0
			};
		}
		return msg;
	};

	return {

		defaultSuccessMsg : 'Your data has been successfully submitted.',

		defaultInvalidMsg : 'Your form contains invalid data, correct it and try again.',

		defaultErrorMsg : 'There was a server communication error while processing your form.',

		defaultResetOnSuccess : false,

		defaultClearOnSuccess : false,

		defaultSubmitMethod : 'POST',

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
				clearOnSuccess : Ext.ux.jnap.form.FormUtils.defaultClearOnSuccess,
				errorMsg : _getErrorMsg,
				invalidMsg : Ext.ux.jnap.form.FormUtils.defaultInvalidMsg,
				resetOnSuccess : Ext.ux.jnap.form.FormUtils.defaultResetOnSuccess,
				msgTarget : undefined,
				onSuccess : Ext.emptyFn,
				onError : Ext.emptyFn,
				successMsg : Ext.ux.jnap.form.FormUtils.defaultSuccessMsg
			});
			var formPanel = opts.form || src.findParentByType(Ext.form.FormPanel);
			if (!formPanel) {
				throw String.format('[FormUtils.submit] The button {0} is not inside a form.', src.id);
			}
			var form = formPanel.getForm();
			if (form.isValid()) {
				var formMethod = opts.method || form.method || formPanel.method;
				if (!formMethod) {
					formMethod = Ext.ux.jnap.form.FormUtils.defaultSubmitMethod;
				}
				formMethod = formMethod.toUpperCase();
				if (formMethod != 'GET' && formMethod != 'POST') {
					formPanel.add({
						xtype : 'hidden',
						name : Ext.ux.jnap.form.FormUtils.restfulMethodParamName,
						value : formMethod
					});
					formMethod = 'POST';
				}
				form.submit({
					url : opts.url || form.url || formPanel.url,
					method : formMethod,
					success : function(form, response) {
						opts.onSuccess.call(form, form, response);
						if (opts.resetOnSuccess) {
							form.reset();
						}
						if (opts.clearOnSuccess) {
							// TODO clear all fields
						}
						Ext.ux.jnap.form.FormUtils.showMessage(formPanel, {
							msg : opts.successMsg,
							type : 'success'
						});
					},
					failure : function(form, response) {
						opts.onError.call(form, form, response);
						var errorMsg = Ext.isFunction(opts.errorMsg)
								? opts.errorMsg.call(form, response)
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
			}
		}

	};
}();