/****************************************************
 �ް��ϊ�PGM  
  @create:2018/04/19
  @author:�Z�Z�Z�Z
*****************************************************/

/***********************************************************************
 �g�p�ҕҏW��
 �֎~�����A�z�z��(�ϊ��O�����ƕϊ��㕶���̑g�ݍ��킹�A�ϊ��O�������ư�)
  �����[@, \, "]���߰��ɕϊ����Ă���
************************************************************************/
var arrayConv = {'@':' ', '\\\\':' ', '"':' '};

//WSH�֘A�̕K�v��޼ު�Ă��擾
var fs = new ActiveXObject( "Scripting.FileSystemObject" );
var stdout = WScript.StdOut;

//JavaScript�ł�trim�̗L�����ɕK�v
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, "");
}

//̧�وꗗ���擾
var cuDir = ".";
var files = fs.GetFolder(cuDir + "/orgData").Files;

//̧�ق�����
var e = new Enumerator(files);
for ( ; !e.atEnd(); e.moveNext()) {
	var file = e.item();
	WScript.Echo("Target File = " + file.Name);

	var impF = fs.OpenTextFile(cuDir + "/orgData/" + file.Name, 1, true, 0);
	var expF = fs.OpenTextFile(cuDir + "/convData/" + file.Name, 2, true, 0);

	var rowRead = "", rowWrite = "", rowData = "", dfKu = "";
	while (!impF.AtEndOfStream) {
		rowRead = impF.ReadLine();
		//1 �`�[����2�A̫�ϯċ敪1(̫�ϯċ敪��1�����������Ȃ�)�݂̂��Ώ�
		dfKu = rowRead.slice(6, 7) + rowRead.slice(13, 14);
		if (dfKu == "21") {
			rowData = getRowData(rowRead);
			expF.WriteLine(rowData);
		}
	}

	//�I������
	impF.Close();
	expF.Close();

	WScript.Echo("��������!!");

 }

files = null;
fs = null;


//�ϊ������A�ڂ��擾����tab����
function getRowData (rowRead) {

	//�֎~������ϊ�
	rowRead = replaceChar(rowRead);

	var newRec = "";

	newRec = alter21(rowRead);

	return newRec;

	//�֎~�����̕ϊ�
	function replaceChar(str) {

		//ں��ޒ��̋֎~������ϊ����Ұ��Œu��������
		for( key in arrayConv ){
			str = str.replace(new RegExp(key, "g" ), arrayConv[key]);
		}

		return str;
	}

	//�ް��敪:2 ̫�ϯċ敪:1 ���ް����`
	function alter21 (d0) {

		var d1 = new String();
		d1 += "3\t";											//�Z�Z�ް���ʋ敪:3�Œ�
		d1 += d0.substr(14, 5).trim() + '\t';					//�Z�Z����
		d1 += d0.substr(19, 3) + '\t';							//��������:�������ނ��g�p
		d1 += d0.substr(68, 6).trim() + '\t';					//ۯ�No
		d1 += "11\t";											//�`�[�敪:11�Œ�
		//�Z�Z�敪�Ɓ����敪(1����,2�Ȃ�)
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
			d1 += 'P\t00\t\t';												//�������Ȃ��͂�
		}
		d1 += d0.substr(30, 3) + "\t";										//����1
		d1 += d0.substr(33, 3) + '00' + d0.substr(36, 2) + '0' + '\t';		//����2
		d1 += d0.substr(19, 3) + '\t';										//����3
		d1 += d0.substr(22, 3) + '00' + d0.substr(25, 2) + '0' + '\t';		//����4
		d1 += d0.substr(38, 30) + '\t';										//���i��
		d1 += ckNaN1(d0.substr(74, 9), 3) + '\t';							//����
		//�P��1
		d1 += (ckNaN1(d0.substr(98, 1).trim() + d0.substr(83, 15), 0) / 100000).toFixed(5) + '\t';
		//���z
		d1 += ckNaN1(d0.substr(110, 1).trim() + d0.substr(99, 11).trim(), 2) + '\t';
		d1 += '\t';

		return d1;

	}

	//NaN��0�ϊ� �K�{���ڗp�Ȃ̂�0��Ԃ�
	function ckNaN1 (str, col) {
		var val = 0;
		if (!isNaN(parseFloat(str))) {
			val = parseFloat(str).toFixed(col) ;
		}
		return val;
	}

}
