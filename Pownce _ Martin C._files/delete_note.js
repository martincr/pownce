/*
delete_note.js
Leah Culver
July 2007
*/

function confirmDelete(is_reply) {
	if (is_reply)
		var item = "reply";
	else
		var item = "note";
    return confirm("Are you sure you want to delete this "+item+" permanently?"); 
}

function deleteNote(note_id, is_reply) {
	$j('#note-delete-button-'+note_id).attr('disabled', 'disabled');
    if (note_id && confirmDelete(is_reply)) {
        $j.ajax({
            url: '/ajax/delete_note/',
            type: 'post',
            data: {ajax_action: 'DELETE_NOTE',
                   note_to_delete: note_id
            },
            success: function(t) {
                ids = t.split(',');
                for(i=0; i < ids.length; i++) {
                    $j('#note'+ids[i]).fadeOut();
                }
                if (is_reply) {
                    // change the title for the replies
                    if($j('#replies-count').length) {
                        var reply_count = parseInt($j('#replies-count').text()) - 1;
                        if (reply_count == 1) {
                            $j('#replies-title').text('1 Reply');
                        } else if (reply_count > 0) {
                            $j('#replies-count').text(''+reply_count);
                        } else {
                            $j('#replies-title').text('Add a Reply');
                            $j('#replies').hide();
                        }
                    }
                }
            },
            error: function(xhr, txtStatus, errorThrown) {
			    alert('error ' + xhr.status + ' -- ' + xhr.statusText);
            }
        });
    }

    $j('#note-delete-button-'+note_id).removeAttr('disabled');
    return false;
}
