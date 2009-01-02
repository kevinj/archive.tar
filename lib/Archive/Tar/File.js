if (typeof(Archive) == 'undefined' || typeof(Archive.Tar) == 'undefined')
    throw new Error("Archive.Tar is required");

Archive.Tar.File = function (header,content) {
    this._hdr = header;
    this._cnt = content;
    return this;
}

Archive.Tar.File.prototype.name = function () { return this._hdr.name };
