if (typeof(Archive) == 'undefined') Archive = {};

Archive.Tar = function () {
    return this;
}

Archive.Tar.prototype.read = function (filename) {
    var request;
    request = new XMLHttpRequest();
    if (!request && window.ActiveXObject) {
	request = new ActiveXObject('Msxml2.XMLHTTP') ||
		  new ActiveXObject('Microsoft.XMLHTTP');
    }

    request.open('GET', filename, false);
    request.setRequestHeader('Accept', 'text/plain; charset=x-user-defined');
    request.send('');

    if (request.status != 200) {
	throw new Error("Error fetching " + filename + ": " + request.status);
    }

    this.load(request.responseText);
}

Archive.Tar.prototype.load = function (content) { 
    this._content = content;
    this._fnames = [];
    this._finfo = {};

    while (1) {
	var block = this._getBlocks(1);
	if (block == undefined) break;

	var header = this._getHeader(block);

	var content = this._strip(
	    this._getBlocks( Math.ceil(header.size / 512) )
	);

	this._fnames.push(header.name);
	this._finfo[header.name] = [header, content];
    }
}

Archive.Tar.prototype.containsFile = function (filename) {
    return Boolean(this._finfo[filename]);
}

Archive.Tar.prototype.listFiles = function () {
    if (!arguments.length || arguments.length == 1 && arguments[0] == 'name') {
	return this._fnames;
    }

    var files = [];
    for (var i=0; i<this._fnames.length; i++) {
	files.push({});
	var fname = this._fnames[i];

	for (var j=0; j<arguments.length; j++) {
	    var field = arguments[j];
	    var value = this._finfo[fname][0][field];

	    if (typeof(value) == 'undefined')
		throw new Error(field + " is not a valid field name");

	    files[i][field] = value;
	}
    }

    return files;
}

Archive.Tar.prototype.getFiles = function (names) {
    if (typeof(Archive.Tar.File) == 'undefined')
	throw new Error("Archive.Tar.File is required");
    
    if (!names || !names.length)
	names = this._fnames;

    var files = [];
    
    for (var i=0; i<names.length; i++) {
	var name = names[i];

	if (!this._finfo[name])
	    throw new Error(name + " does not exist in the tar archive");
	    
	files.push(new Archive.Tar.File(this._finfo[name][0], 
					this._finfo[name][1]
				       )
		  );
    }

    return files;
}

Archive.Tar.prototype.getContent = function (file) {
    return this._finfo[file] ? this._finfo[file][1] : undefined;
}

/**
 * private methods
 */

Archive.Tar.prototype._getBlocks = function (blocks) {
    var new_offset = 512 * blocks;
    var block = this._content.slice(0, new_offset);

    if (block.match(/^\0+$/)) {
	return undefined;
    }

    this._content = this._content.slice(new_offset, this._content.length);
    return block;
}

Archive.Tar.prototype._strip = function (str) {
    return str.substr(0, str.indexOf(String.fromCharCode(0)));
}

Archive.Tar.prototype._getRec = function (str, bytes) {
    // Get bytes from our current position in str, then advance pos
    str = str.substr(this._pos, bytes);
    this._pos += bytes;
    
    // Strip off NULLs
    return this._strip(str);
}

Archive.Tar.prototype._getHeader = function (block) {
    this._pos = 0;
    return {
	name     : this._getRec(block, 100),

	mode     : parseInt( '0' + this._getRec(block,8) ),
	uid      : parseInt( '0' + this._getRec(block,8) ),
	gid      : parseInt( '0' + this._getRec(block,8) ),
	size     : parseInt( '0' + this._getRec(block,12) ),
	mtime    : new Date( parseInt( '0' + this._getRec(block,12)) * 1000 ),
	chksum   : parseInt( '0' + this._getRec(block,8) ),

	typeflag : parseInt( '0' + this._getRec(block,1) ),
	linkname : this._getRec(block,100),

	// USTAR stuff
	magic    : parseInt( '0' + this._getRec(block,6)),
	version  : parseInt( '0' + this._getRec(block,2)),

	uname    : this._getRec(block,32),
	gname    : this._getRec(block,32),

	devmajor : parseInt( '0' + this._getRec(block,8) ),
	devminor : parseInt( '0' + this._getRec(block,8) ),

	prefix   : this._getRec(block,155)
    };
}

