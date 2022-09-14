(function(){
    let senderID;
    const socket = io();

    function generateID(){
        return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
    }

    document.getElementById("ti-searchsearch-icon").addEventListener("click", function(){
        senderID = document.getElementById("search").value;
        if(senderID.length == 0){
            return;
        }
        let joinID = generateID();        
        socket.emit("receiver-join", {
            uid:joinID,
            sender_uid:senderID
        });
        $('#search').hide();
        $('#ti-searchsearch-icon').hide();
        $('#connected').show();
	});

    let fileShare = {};
    socket.on("fs-meta", function(metadata){
        fileShare.metadata = metadata;
        fileShare.transmitted = 0;
        fileShare.buffer = [];
        
        //$('.filename1').html(metadata.filename);
        let el = document.createElement("div");
		el.classList.add("item");
		el.innerHTML = `
				<div class="progress1">0%</div>
				<div class="filename1">${metadata.filename}</div>
		`;
		document.querySelector(".content1").appendChild(el);

		fileShare.progrss_node = el.querySelector(".progress1");

        socket.emit("fs-start", {
            uid:senderID
        });
    });

    socket.on("fs-share",function(buffer){
		console.log("Buffer", buffer);
		fileShare.buffer.push(buffer);
		fileShare.transmitted += buffer.byteLength;
		fileShare.progrss_node.innerText = Math.trunc(fileShare.transmitted / fileShare.metadata.total_buffer_size * 100)+"%";
		if(fileShare.transmitted == fileShare.metadata.total_buffer_size){
			console.log("Download file: ", fileShare);
			download(new Blob(fileShare.buffer), fileShare.metadata.filename, "application/octet-stream");
			fileShare = {};
            $('#done').show();
		} else {
			socket.emit("fs-start",{
				uid:senderID
			});
		}
	});

})();