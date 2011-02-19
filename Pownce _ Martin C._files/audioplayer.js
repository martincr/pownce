/*
 * vim:et sts=4 sw=4 cindent:
 * $Id$
 */

var audioCounter = 0;

function audioplayer(url, noteID)
{
    var swf = new SWFObject('/js/audioplayer.swf',
                            'audio' + (audioCounter++),
                            '100%', 26, 9);
    swf.addParam('wmode', 'transparent');
    var flashVars = {url: url};
    swf.addParam('FlashVars', urlencode(flashVars));
    swf.write('audio' + noteID);
}
