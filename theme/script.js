var droppedFiles = false;
var fileName = '';
var $dropzone = $('.dropzone');
var $button = $('.upload-btn');
var uploading = false;
var $syncing = $('.syncing');
var $done = $('.done');
var $bar = $('.bar');
var timeOut;

$dropzone.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
	e.preventDefault();
	e.stopPropagation();
})
	.on('dragover dragenter', function() {
	$dropzone.addClass('is-dragover');
})
	.on('dragleave dragend drop', function() {
	$dropzone.removeClass('is-dragover');
})
	.on('drop', function(e) {
	droppedFiles = e.originalEvent.dataTransfer.files;
	fileName = droppedFiles[0]['name'];
	$('.filename').html(fileName);
	$('.dropzone .upload').hide();
});


/*$("input:file").change(function (){
	fileName = $(this)[0].files[0].name;
	$('.filename').html(fileName);
	$('.dropzone .upload').hide();
});*/

(function(){
    let receiverId;
    const socket = io();

    function generateID(){
        return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
    }

	socket.on("init", function(uid){
		receiverId = uid;
	});

	document.getElementById("file-input").addEventListener("change", function(e){
		let file = e.target.files[0];
		let fileName = $(this)[0].files[0].name;
		$('.filename').html(fileName);
		$('.dropzone .upload').hide();
		if(!file){
			return;
		}
		let reader = new FileReader();
		reader.onload = function(e){
			let buffer = new Uint8Array(reader.result);
			document.getElementById("upload-btn").addEventListener("click", function(){
				let joinID = generateID();
				document.getElementById("joinID").style.display = "none";
				document.getElementById("joinID").innerHTML = `${joinID}`;
				if (!uploading && fileName != '' ){
					alert("Your Code is: "+joinID);
					uploading = true;
					$button.html('Uploading...');
					$dropzone.fadeOut();
					$syncing.addClass('active');
					$done.addClass('active');
					$bar.addClass('active');
					timeout = window.setTimeout($button.html('Done'), 3200);
				}
				else{
					location.reload();
				}
				socket.emit("sender-join",{
					uid:joinID
				});
			});
		}
		reader.readAsArrayBuffer(file);
	});

})();

(function(){
    let senderID;
    const socket = io();

    function generateID(){
        return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
    }

    document.getElementById("ti-search search-icon").addEventListener("click", function(){
        senderID = document.getElementById("joinID").value;
        if(senderID.length==0){
            return;
        }
        let joinID = generateID();
        
        socket.emit("receiver-join",{
            uid:joinID,
            sender_uid:senderID
        });
    });
	let fileShare = {}

	socket.on("fs-meta", function(metadata){
		fileShare.metadata = metadata;
		fileShare.transmitted = 0;
		fileShare.buffer = [];
		$('.filename1').html(metadata.fileName);
		
		socket.emit("fs-start", {
			uid:senderID
		});
	});

	socket.on("fs-share", function(buffer){
		fileShare.buffer.push(buffer);
		fileShare.transmitted+= buffer.byteLenght;
		if(fileShare.transmitted == fileShare.metadata.total_buffer_size){
			download(new Blob(fileShare.buffer), fileShare.metadata.fileName);
			fileShare = {};
		}
		else{
			socket.emit("fs-start",{uid:senderID});
		}
	})

})();