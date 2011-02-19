/*
note_bit.js
Courtstarr
August 2007
*/

// mark a file link to contain the class visited
function markAsDownloaded(link, note_id, note_count, verb) {
    $link = $j(link);

    // check if the link has already been marked as visited
    if (!$link.hasClass('visited')) {
        $link.addClass('visited');
    }
    if(note_count) {
        var count_text = note_count.text();
        var count;
        if (count_text) {
            console.log(count_text);
            count = parseInt(count_text.substring(1,count_text.length).split(' ')[0]) + 1;
        } else {
            count = 1;
        }
        note_count.html('(' + count + ' ' + verb + (count > 1 ? 's' : '') + ')');
    }
    // ajax for marking a link as clicked
    if(verb == "view"){
        $j.ajax({
            url: '/ajax/update_url_click_count/',
            type: 'post',
            data: { note_id: note_id },
            success: function(t) {},
            error: function(xhr, txtStatus, errorThrown) { /* ignore the error... clicks still appear to be counted */ }
        });
    }
}
