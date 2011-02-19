/*
main.js
by Leah Culver
*/

var originalTitle=document.title;

// functions to blink the title of the page with a message
function blinkTitle(message, count) {
    blinkingTitle(count, message, true);
}

function blinkingTitle(count, message, blink){
    if(blink){
        document.title=message;
    } else {
        document.title=originalTitle;
        count-- // decrement the number of times left to blink
    }
    if (count > 0) {
        blinkTimer = setTimeout("blinkingTitle("+count+", '"+message+"', "+!blink+")", 800);
    }
}

// display status or error message
function showStatusMessage(msg) {
    hideMessage();
    $j('#message_div').createAppend(
        'div', {id:'statusmsg', style:{display:'none'}}, [
            'span', {}, msg,
            'a', {id:'msg-close', href:'#', onclick:'$j("#statusmsg").fadeOut(); return false;'}, 'close'
        ]
    ).fadeIn();
}

// display error message
function showErrorMessage(msg) {
    hideMessage();
    $j('#message_div').createAppend(
        'div', {id:'errormsg', style:{display:'none'}}, [
            'span', {}, msg,
            'a', {id:'msg-close', href:'#', onclick:'$j("#errormsg").fadeOut(); return false;'}, 'close'
        ]
    ).fadeIn();
}

// clear status/error message
function hideMessage() {
	$j('div#message_div div').remove();
}

function verifyDelete(delete_item){
    conf = confirm("Are you sure you want to delete "+delete_item+"?");
    if (conf) {
        return true;
    }
    return false;
}

/**
 * Format an object as URL-encoded variables.
 */
function urlencode(vars)
{
    var parts = new Array();
    var n;
    for (n in vars)
    {
        parts.push(n + '=' + escape(vars[n]));
    }
    return parts.join('&');
}

function flagSpam(id, is_spam) {
    $j.ajax({
        url: '/ajax/flag_spam/',
        type: 'post',
        data: {action: (is_spam ? 'flag' : 'unflag'),
               note_id: id
        },
        success: function(t) {
            if(t == 'flagged') {
                $j('#flag-' + id).hide();
                $j('#unflag-' + id).show();
            }
            else if(t == 'unflagged') {
                $j('#unflag-' + id).hide();
                $j('#flag-' + id).show();
            }
        },
        error: function(xhr, txtStatus, errorThrown) {
			alert('error ' + xhr.status + ' -- ' + xhr.statusText);
        }
    });

    return false;
}
