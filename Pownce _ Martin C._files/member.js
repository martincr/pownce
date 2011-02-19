/*
member.js
Leah Culver
February 2007
*/

function filterNotes() {
    $j('#filter_notes').submit();
    return false;
}

function displayNoteType(divID, is_pro) {
    $new_note = $j('#new-note');
    $new_note.action = ".";
    var enctype = 'application/x-www-form-urlencoded';
    if(divID == 'note-file') {
        enctype = 'multipart/form-data';
    }
    $new_note.attr('enctype', enctype);
    $new_note.attr('encoding', enctype); // stupid IE doesn't recognize enctype... gotta set encoding too.

    $j('.note-type').hide();
    if(divID && divID != "None" && divID != "note-message") {
        $j('#' + divID).show();
    }
    if(divID && divID != "None") {
        $j('.note-current').removeClass('note-current').addClass('note-link');
        $j('#'+divID+'-link').removeClass('note-link').addClass('note-current');
        // change the hidden field value
        $j('#id_note_type').val(divID);
    }
    return false;
}

function sendNote() {
	// disable submit button and hide form
	$j('#post-note').attr('disabled', 'disabled');
    $j('#new-note').hide();
	
    hideMessage();
    note_type = $j('#id_note_type').val();
    body = $j('#id_note_body').val();

    // javascript validations
    if (body == "" || body == $j('#default_note').text()) {
        // message only notes require some text
        if (note_type == 'note-message') {
            showErrorMessage("Please enter some text for the note.");
            $j('#post-note').removeAttr('disabled');
            $j('#new-note').show();
            return false;
        } else {
            // clear the default note
            $j('#id_note_body').val('');
        }
    }
    if (note_type == 'note-file') { // file is required
        if ($j('#id_media_file').val() == '') {
            showErrorMessage("File is required.");
            $j('#post-note').removeAttr('disabled');
            $j('#new-note').show();
            return false;
        }
    } else if (note_type == 'note-event') {
        errormsg = ''
        if ($j('#id_event_name').val() == '' || $j('#id_event_name').val() == $j('#default_event_name').text()) {
            errormsg += " Event name is required.";
        }
        if ($j('#id_event_location').val() == '' || $j('#id_event_location').val() == $j('#default_event_location').text()) {
            errormsg += " Event location is required.";
        }
        if ($j('#id_event_time').val() == '') {
            errormsg += " Event time is required.";
        }
        if (errormsg != '') {
            showErrorMessage(errormsg);
            $j('#post-note').removeAttr('disabled');
            $j('#new-note').show();
            return false;
        }
    } else if (note_type == 'note-link') {
        if ($j('#id_url').val() == '' || $j('#id_url').val() == 'http://') {
            showErrorMessage("Link URL is required.");
            $j('#post-note').removeAttr('disabled');
            $j('#new-note').show();
            return false;
        }
    }

    // submit the form
    // file upload progress bar doesn't work correctly in Safari
    if (note_type == 'note-file' && !$j.browser.safari) {
    	submitForm('new-note', 'new-note-frame');
    } else {
    	$j('#loading-note').show();
    }
    // submit the form
    $j('#new-note').submit();
   	return true;
}

function validateFriendSearch() {
    if ($j('#friend-search').val() == '') {
        showErrorMessage("Enter some search text.");
        return false;
    }
    if (!$j('#friend-search').val().match(/\S{3,}/)) {
        showErrorMessage("Search queries must be three characters or longer.");
        return false;
    }
    return true;
}

function addFriend(member, id) {
    hideMessage();
    
    // hide request friend form and re-enable the submission button
    $j('#request-friend-'+id).hide().removeAttr('disabled');

    // show twirly waiting gif
    $j('#loading-'+id).show()
    
    $j.ajax({
        url: '/ajax/request_friend/',
        type: 'post',
        data: { action: 'ADD_FRIEND',
                friend: member,
                message: $j('#request-friend-form'+id).val() || ''
        },
        success: function(t) {
            if (t == 'pending') {
                if($j('#pending-'+id).length) {
                    $j('#loading-'+id).hide();
                    $j('#pending-'+id).fadeIn();
                    $j('#add-button-'+id).removeAttr('disabled');
                } else {
                    try {
                        // go to the person's page
                        document.location.href = '/'+member+'/';
                    } catch(ex) {}
                }
            }
        },
        error: function(xhr, txtStatus, errorThrown) {
			alert('error ' + xhr.status + ' -- ' + xhr.statusText);
        }
    });

    return false;
}

function cancelRequest(user_id) {
    // hide friend request form
    $j('#request-friend-'+user_id).hide();
    
    // if in a list, reshow the user item
    if ($j('#user-'+user_id).fadeIn().length) {
        return false;
    } else {
        try {
            // go back to previous page
            history.go(-1);
            return false;
        } catch(ex) {
            return true;
        }
    }
    return true;
}

function confirmFriend(member, id) {
    hideMessage();

    // hide request friend form
    $j('#user-'+id).hide()
    
    $j.ajax({
        url: '/ajax/confirm_friend/',
        type: 'post',
        data: { action: 'CONFIRM_FRIEND',
                friend: member
        },
        success: function(t) {
            if (! $j('#complete-'+id).fadeIn().length) {
                // to the person's home page
                try {
                    document.location.href = '/' + member + '/';
                } catch(ex) {}
            }
        },
        error: function(xhr, txtStatus, errorThrown) {
			alert('error ' + xhr.status + ' -- ' + xhr.statusText);
        }
    });

    $j("#accept-friend-"+member).removeAttr('disabled');
    return false;
}

function cancelFriend(member, id, reshow_friend) {
    hideMessage();
    
    $j('#pending-'+id).hide();

    if (reshow_friend) {
        $j('#user-'+id).fadeIn();
        $j('#add-friend-'+id).fadeIn();
        $j('#subscribe-form-'+id).fadeIn();
    } else {
        $j('#user-'+id).hide();
        showStatusMessage("You're no longer a fan of "+member+".");
    }

    $j.ajax({
        url: '/ajax/cancel_friend/',
        type: 'post',
        data: { action: 'CANCEL_FRIEND',
                friend: member
        },
        success: function(t) { },
        error: function(xhr, txtStatus, errorThrown) {
			alert('error ' + xhr.status + ' -- ' + xhr.statusText);
        }
    });
    
    $j("#cancel-friend-"+id).removeAttr('disabled');
    return false;
}

function subscribeTo(member, id) {
    $j.ajax({
        url: '/ajax/subscribe/',
        type: 'post',
        data: { action: 'SUBSCRIBE',
                friend: member
        },
        success: function(t) {
            $j('#subscribe-form-'+id).hide();
            $j('#subscribe-'+id).removeAttr('disabled');
            $j('#add-friend-'+id).hide();
            $j('#cancel-friend-'+id).fadeIn();
        },
        error: function(xhr, txtStatus, errorThrown) {
            $j('#subscribe-'+id).removeAttr('disabled');
            alert('error ' + xhr.status + ' -- ' + xhr.statusText);
        }
    });

    return false;
}

function blockUser(username) {
    var conf = confirm("Are you sure you want to block "+username+"?");
    if (conf) {
        $j("#form-block-"+username).submit();
    }
    $j('#block-'+username).removeAttr('disabled');
    return false;
}

function blockFriendRequest(fan, request_id) {
    return confirm("Are you sure you want to block "+fan+"?");
}

function removeFriend(friend) {
    var conf = confirm("Are you sure you want to unfriend "+friend+"?");
    if (conf) {
        $j("#form-remove-"+friend).submit();
    } else {
        $j('#unfriend-'+friend).removeAttr('disabled');
    }
    return false;
}

function removeFriendFromList(friend, id) {
    var conf = confirm("Are you sure you want to unfriend "+friend+"? This will remove all their notes from your page as well.");
    if (conf) {
        $j.ajax({
            url: '/ajax/remove_friend/',
            type: 'post',
            data: {action: 'REMOVE_FRIEND',
                   friend: friend
            },
            success: function(t) {
                $j('#user-'+id).fadeOut();
                showStatusMessage(friend+' unfriended.');
            },
            error: function(xhr, txtStatus, errorThrown) {
                alert('error ' + xhr.status + ' -- ' + xhr.statusText);
            }
        });
    } else {
        $j('#form-remove-'+friend+' .remove').removeAttr('disabled');
    }
    return false;
}

function confirmPending(status) {
    if (status == 'accept') {
        conf = confirm("Are you sure you would like to accept these people as friends?");
    } else if (status == 'deny') {
        conf = confirm("Are you sure you would like to leave these people as fans?");
    }
    if (conf) {
        $j('#friend_all_form').submit();
        return true;
    }
    return false;
}
