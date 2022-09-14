(function(){
    var $dropzone = $('.dropzone');
    var $button = $('.upload-btn');
    var uploading = false;
    //var $bar = $('.bar');

$dropzone.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
	e.preventDefault();
	e.stopPropagation();
})
	.on('dragover dragenter', function() {
	$dropzone.addClass('is-dragover');
})
	.on('dragleave dragend drop', function() {
	$dropzone.removeClass('is-dragover');
});
    let receiverId;
    const socket = io();

    function generateID(){
        return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
    }

    document.getElementById("getcode").addEventListener("click", function(){
        let joinID = generateID();
        alert("Your Code is : "+joinID);

        socket.emit("sender-join", {
            uid:joinID
        });
	});

    socket.on("init", function(uid){
        receiverId = uid;
        $('#getcode').hide(); 
        $('#frame').show();

    });
    document.getElementById("file-input").addEventListener("change", function(e){
		let file = e.target.files[0];
		let fileName = file.name;
		$('.filename').html(fileName);
		$('.dropzone .upload').hide();
		if(!file){
			return;
		}
        let reader = new FileReader();
        reader.onload = function(e){
            let buffer = new Uint8Array(reader.result);
            document.getElementById("submit").addEventListener("click", function(){
                if (!uploading && fileName != '' ){
					uploading = true;
					let el = document.createElement("div");
			        el.classList.add("item");
			        el.innerHTML = `
					    <div class="progress1">0%</div>
			        `;
					document.querySelector(".content").appendChild(el);
					//$bar.addClass('active');
                    
                    shareFile({
                        filename: fileName,
                        total_buffer_size:buffer.length,
                        buffer_size:4096,
                    }, buffer, el.querySelector(".progress1"));
                    $button.html("Done");
				}
				else{
					location.reload();
				}
            });
        }
        reader.readAsArrayBuffer(file);
    });

    function shareFile(metadata, buffer, progress_node){
		socket.emit("file-meta", {
			uid:receiverId,
			metadata:metadata
		});
		
		socket.on("fs-share", function(){
            console.log(buffer);
			let chunk = buffer.slice(0,metadata.buffer_size);
			buffer = buffer.slice(metadata.buffer_size,buffer.length);
			progress_node.innerText = Math.trunc(((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size * 100)) + "%";
			if(chunk.length != 0){
				socket.emit("file-raw", {
					uid:receiverId,
					buffer:chunk
				});
			} else {
				console.log("Sent file successfully");
			}
		});
	}

})();