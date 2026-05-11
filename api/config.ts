//API接続先は api/config.ts で一元管理し、他のAPIファイルから import して使う方針。

export const API_BASE_URL = 'http://localhost:8080';

//これは iOSシミュレータ では通りやすいですが、実機 だと通らないことがあります。実機でやるときは Mac のIPに変えます。
//export const API_BASE_URL = 'http://192.168.1.8:8080';
//まず localhost:8080 を入れる
//GET /health で接続確認する
//もしつながらなければ、Mac のIPアドレスに変える


