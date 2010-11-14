/*
 * 
 */
(function() {

	var _ns = Ext.ux.jnap;

	// NotificationMessage
	if (_ns.NotificationMessage) {
		_ns.NotificationMessage.prototype.closeTitle = 'Fechar mensagem';
	}

	// CharactersLimitPlugin
	if (_ns.form.CharactersLimitPlugin) {
		_ns.form.CharactersLimitPlugin.prototype.text = 'Voc� possui <strong>{0}</strong> caracteres restantes';
	}

	// FormUtils
	if (_ns.form.FormUtils) {
		_ns.form.FormUtils.defaultSuccessMsg = 'Seus dados foram enviados com sucesso.';
		_ns.form.FormUtils.defaultInvalidMsg = 'Seu formul�rio cont�m dados inv�lidos, corrija-os e tente novamente.';
		_ns.form.FormUtils.defaultErrorMsg = 'Houve um erro de comunica��o com o servidor no processamento do seu formul�rio';
	}

	// RequiredFieldsPlugin
	if (_ns.form.RequiredFieldsPlugin) {
		_ns.form.RequiredFieldsPlugin.prototype.hintText = 'Os campos marcados com {0} s�o obrigat�rios';
	}

})();