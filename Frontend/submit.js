let api_key = "";
let api_url = "";


let apigClient = apigClientFactory.newClient({apiKey: api_key});
api_url = api_url + "/upload";

function s3upload() {
	var files = document.getElementById("fileUpload").files;
	var file = files[0];
	var fileName = file.name;

	async function postData(url = "") {
		let response = await fetch(url, {
			method: "PUT",
			headers: {
				Bucket: "smart-album-photos-<id>",
				Key: fileName,
				"Content-Type": "image/png",
				"X-API-Key": api_key
			},
			body: file,
        });
        status = response.status
        if(status==200){
            document.getElementById("uploadResponse").style.color = "Green"
            document.getElementById('uploadResponse').innerHTML = "Uploaded"
            document.getElementById("fileUpload").value = ''
        }
        else{
            document.getElementById("uploadResponse").style.color = "Red"
            document.getElementById('uploadResponse').innerHTML = "Upload Failed"
        }
        console.log(status)
	}
	postData(api_url)
		.then()
		.catch((data) => {
			console.log(data);
		});
}

document.getElementById("search-form").addEventListener("submit", search);

function search() {
    let search_val = document.getElementById("search").value;
    document.getElementById('uploadResponse').innerHTML = ""
	apigClient.searchGet({ "q": search_val},{},{}).then((data) => {
		document.getElementById("photos").innerHTML = "";
        console.log(data)
        let hits = data["data"]["results"];
		let hit;
		for (hit of hits) {
			let img_src = hit["url"];
			let img = document.createElement("img");
			img.src = img_src;
			img.style.height = "200px";
			document.getElementById("photos").appendChild(img);
		}
	}).catch((d)=>console.log(d))
}


transcribe("transcribe-btn", "search")

function transcribe(btnId, inputId) {
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

  var recognition = new SpeechRecognition();
  recognition.grammars = new SpeechGrammarList();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  var transcribeBtn = document.getElementById(btnId);
  var inputField = document.getElementById(inputId);

  transcribeBtn.onclick = function() {
    recognition.start();
  }

  recognition.onresult = function(event) {
    inputField.value = event.results[0][0].transcript
    search()
  }

  recognition.onspeechend = function() {
    recognition.stop();
  }
}