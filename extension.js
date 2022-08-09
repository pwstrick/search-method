/*
 * @Author: strick
 * @LastEditors: strick
 * @Date: 2022-08-08 16:32:12
 * @LastEditTime: 2022-08-09 11:03:52
 * @Description: 查找方法
 * @FilePath: /search-method/extension.js
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { Uri, window, Position, Range, Selection } = vscode;
function activate(context) {
	const disposable = vscode.commands.registerCommand('search-method.services',  (uri) => {
		// 获取编辑器对象
        const editor = window.activeTextEditor;
		if(!editor) {
            return;
        }
		// 当前选中的代码所处的绝对位置
		const dirPath = uri.fsPath;
		// services的绝对目录
		const serviceDir = path.resolve(dirPath, '../../services');
		// 获取选中文本
		const doc = editor.document;
		const selection = editor.selection;
		const words = doc.getText(selection).split('.');
		const serviceName = words[0];
		const methodName = words.length > 1 ? words[1] : '';
		// 列出目录中所有的文件
		const files = fs.readdirSync(serviceDir);
		for(const item of files) {
			// 读取文件名称
			const name = item.split('.')[0];
			// 文件匹配
			if(serviceName === name) {
				const file = Uri.file(path.resolve(serviceDir, item));
				// 根据换行符分隔字符串
				const fileContentArr = fs.readFileSync(path.resolve(serviceDir, item), 'utf8').split(/\r?\n/);
				// 声明的方法会有 async 关键字，或者通过空格和括号匹配
				const index = fileContentArr.findIndex(element => 
					element.indexOf(`async ${methodName}`) >= 0 || element.indexOf(` ${methodName}(`) >= 0)
				// 跳转到指定行数的文件
				window.showTextDocument(file).then(editor => {
					// 开始位置
					const start = new Position(index, 0);
					// 结束位置加了 20 行，为了便于查看
					const end = new Position(index + 20, 0);
					// 光标聚焦的位置
					editor.selections = [new Selection(start, start)];
					// 可见范围
					const range = new Range(start, end);
					editor.revealRange(range);
				});
				break;
			}
		}
		// vscode.window.showInformationMessage(word);
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
