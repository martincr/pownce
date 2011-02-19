// Brad Fitzpatrick brad at danga.com
// Sat Nov 5 00:06:03 PST 2005

// http://lists.danga.com/pipermail/perlbal/2005-November/000138.html

// Modified (only slightly) by Leah Culver
// June 2007

var is_pro = false; // flag for pro user
var user_max_upload; // max upload size for the user, defined in the settings
var user_max_upload_mb; // set in the html
var pro_max_upload_mb; // set in the html
var uptrack; // our Perlbal upload tracker object, if defined

// called from iframe's content on complete, with a URL of where we should go:
function onUploadComplete (destURL) {
	// if an upload has completed go to the destination url
	if (uptrack) {
		window.location = destURL;
	}
}

// called by the perlbal upload tracker library:  (we pass it this function below)
function uploadCallback (data) {
    if (! (data && data.total)) return;
    
    // update the display
    var kbps = Math.floor(data.done / (data.nowtime - data.starttime) / 1024)
    var percent = Math.floor(data.done * 100 / data.total);
    $j("#progress-bar").css('width', percent + "%");
    var status = Math.floor(data.done / 1024) + " kB of " + Math.floor(data.total / 1024) + " kB (" + kbps + "kB/s), " + percent + "% Complete";
    $j("#upload-status").html(status);
}

function submitForm(formID, targetFrame) {
    if (uptrack) uptrack.stopTracking();

    var frm = document.getElementById(formID);

    frm.target = targetFrame; // change target to our iframe

    // create the actual Perlbal upload tracker object:
    uptrack = new UploadTracker(frm, uploadCallback);
	
	// show the progress bar
    $j("#upload-status").html("Uploading, please wait...");
    $j("#progress-note").show();
    return true;
}

////// public interface:

function UploadTracker (formele, cb) {
    this.form     = formele;
    this.callback = cb;
    this.session  = UploadTracker._generateSession();
    this.stopped  = false;

    var action = this.form.action;
    if (action.match(/\bclient_up_sess=(\w+)/)) {
        action = action.replace(/\bclient_up_sess=(\w+)/, "client_up_sess=" + this.session);
    } else {
        action += (action.match(/\?/) ? "&" : "?");
        action += "client_up_sess=" + this.session;
    }
    this.form.action = action;

    this._startCheckStatus();
}


// method to stop tracking a form's upload status
UploadTracker.prototype.stopTracking = function () {
    this.stopped = true;
};


// private implementation details:
UploadTracker._XTR = function () {
    var xtr;
    var ex;

    if (typeof(XMLHttpRequest) != "undefined") {
        xtr = new XMLHttpRequest();
    } else {
        try {
            xtr = new ActiveXObject("Msxml2.XMLHTTP.4.0");
        } catch (ex) {
            try {
                xtr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (ex) {
            }
        }
    }

    // let me explain this.  Opera 8 does XMLHttpRequest, but not setRequestHeader.
    // no problem, we thought:  we'll test for setRequestHeader and if it's not present
    // then fall back to the old behavior (treat it as not working).  BUT --- IE6 won't
    // let you even test for setRequestHeader without throwing an exception (you need
    // to call .open on the .xtr first or something)
    try {
        if (xtr && ! xtr.setRequestHeader)
            xtr = null;
    } catch (ex) { }

    return xtr;
};


UploadTracker._generateSession = function () {
    var str = Math.random() + "";
    return curSession = str.replace(/[^\d]/, "");
};


UploadTracker.prototype._startCheckStatus = function () {
    var uptrack = this;
    if (uptrack.stopped) return true;

    var xtr = UploadTracker._XTR();
    if (!xtr) return;

    var callback = function () {
        if (xtr.readyState != 4) return;
        if (uptrack.stopped)     return;

        if (xtr.status == 200) {
        	//alert(xtr.responseText);
            var val;
            eval("val = " + xtr.responseText + ";");
            // check if the upload is too large
    		if (val && val.total && val.total > user_max_upload) {
    			// fail
    			//showErrorMessage('File size exceeds upload limits.');
    			var errmsg = 'Ack! The file you chose is too big. You can only send files up to ' + user_max_upload_mb + ' MB.';
    			if (!is_pro) {
    				errmsg += ' Upgrade to a pro account to send files up to ' + pro_max_upload_mb + ' MB!';
    			}
    			alert(errmsg);
    			uptrack.stopped = true;
    			// redirect to free the browser from processing the upload
    			//window.location = '/';
    			return;
    		}
            uptrack.callback(val);
        }
        setTimeout(function () { uptrack._startCheckStatus(); }, 1000);
    };

    xtr.onreadystatechange = callback;
    xtr.open("GET", "/__upload_status?client_up_sess=" + uptrack.session + "&rand=" + Math.random());
    xtr.send(null);
}
