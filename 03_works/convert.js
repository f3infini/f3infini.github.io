/****************************************************
 ﾃﾞｰﾀ変換PGM  
  @create:2018/04/19
  @author:〇〇〇〇
*****************************************************/

/***********************************************************************
 使用者編集可
 禁止文字連想配列(変換前文字と変換後文字の組み合わせ、変換前文字はﾕﾆｰｸ)
  これは[@, \, "]をｽﾍﾟｰｽに変換している
************************************************************************/
var arrayConv = {'@':' ', '\\\\':' ', '"':' '};

//WSH関連の必要ｵﾌﾞｼﾞｪｸﾄを取得
var fs = new ActiveXObject( "Scripting.FileSystemObject" );
var stdout = WScript.StdOut;

//JavaScriptではtrimの有効化に必要
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}

//ﾌｧｲﾙ一覧を取得
var cuDir = ".";
var files = fs.GetFolder(cuDir + "/orgData").Files;

//ﾌｧｲﾙを処理
var e = new Enumerator(files);
for ( ; !e.atEnd(); e.moveNext()) {
	var file = e.item();
	WScript.Echo("Target File = " + file.Name);

	var impF = fs.OpenTextFile(cuDir + "/orgData/" + file.Name, 1, true, 0);
	var expF = fs.OpenTextFile(cuDir + "/convData/" + file.Name, 2, true, 0);

	var rowRead = "", rowWrite = "", rowData = "", dfKu = "";
	while (!impF.AtEndOfStream) {
		rowRead = impF.ReadLine();
		//1 伝票識別2、ﾌｫｰﾏｯﾄ区分1(ﾌｫｰﾏｯﾄ区分は1しか発生しない)のみが対象
		dfKu = rowRead.slice(6, 7) + rowRead.slice(13, 14);
		if (dfKu == "21") {
			rowData = getRowData(rowRead);
			expF.WriteLine(rowData);
		}
	}

	//終了処理
	impF.Close();
	expF.Close();

	WScript.Echo("処理完了!!");

 }

files = null;
fs = null;


//変換処理、目を取得してtab結合
function getRowData (rowRead) {

	//禁止文字を変換
	rowRead = replaceChar(rowRead);

	var newRec = "";

	newRec = alter21(rowRead);

	return newRec;

	//禁止文字の変換
	function replaceChar(str) {

		//ﾚｺｰﾄﾞ中の禁止文字を変換ﾊﾟﾗﾒｰﾀで置き換える
		for( key in arrayConv ){
			str = str.replace(new RegExp(key, "g" ), arrayConv[key]);
		}

		return str;
	}

	//ﾃﾞｰﾀ区分:2 ﾌｫｰﾏｯﾄ区分:1 のﾃﾞｰﾀ整形
	function alter21 (d0) {

		var d1 = new String();
		d1 += "3\t";											//〇〇ﾃﾞｰﾀ種別区分:3固定
		d1 += d0.substr(14, 5).trim() + '\t';					//〇〇ｺｰﾄﾞ
		d1 += d0.substr(19, 3) + '\t';							//△△ｺｰﾄﾞ:□□ｺｰﾄﾞを使用
		d1 += d0.substr(68, 6).trim() + '\t';					//ﾛｯﾄNo
		d1 += "11\t";											//伝票区分:11固定
		//〇〇区分と□□区分(1あり,2なし)
		if (d0.substr(29, 1) == 'G') {
			d1 += 'G\t00\t\t';
		} else if (d0.substr(29, 1) == 'N') {
			d1 += 'P\t10\t\t';
		} else if (d0.substr(29, 1) == 'P') {
			d1 += 'P\t99\t\t';
		} else if (d0.substr(29, 1) == 'A') {
			d1 += 'P\t20\t\t';
		} else if (d0.substr(29, 1) == 'Y') {
			d1 += 'Y\t00\t\t';
		} else {
			d1 += 'P\t00\t\t';												//発生しないはず
		}
		d1 += d0.substr(30, 3) + "\t";										//ｺｰﾄﾞ1
		d1 += d0.substr(33, 3) + '00' + d0.substr(36, 2) + '0' + '\t';		//ｺｰﾄﾞ2
		d1 += d0.substr(19, 3) + '\t';										//ｺｰﾄﾞ3
		d1 += d0.substr(22, 3) + '00' + d0.substr(25, 2) + '0' + '\t';		//ｺｰﾄﾞ4
		d1 += d0.substr(38, 30) + '\t';										//製品名
		d1 += ckNaN1(d0.substr(74, 9), 3) + '\t';							//数量
		//単価1
		d1 += (ckNaN1(d0.substr(98, 1).trim() + d0.substr(83, 15), 0) / 100000).toFixed(5) + '\t';
		//金額
		d1 += ckNaN1(d0.substr(110, 1).trim() + d0.substr(99, 11).trim(), 2) + '\t';
		d1 += '\t';

		return d1;

	}

	//NaN→0変換 必須項目用なので0を返す
	function ckNaN1 (str, col) {
		var val = 0;
		if (!isNaN(parseFloat(str))) {
			val = parseFloat(str).toFixed(col) ;
		}
		return val;
	}

}
