//declairation of variables
var imgarray = [];
var bkmkimgarray = ['../assets/icons/1.png', '../assets/icons/2.png', '../assets/icons/3.png', '../assets/icons/4.png', '../assets/icons/5.png', '../assets/icons/6.png', '../assets/icons/7.png', '../assets/icons/8.png', '../assets/icons/9.png', '../assets/icons/10.png', '../assets/icons/11.png'];
var usrSettings = [];
var loadSettings = [];
var bkinfo = [];
var setEngine;
var searchinfo = [];
var setBG = [];
var bgInfo = [];
var google = 'https://google.com/#q=';
var yahoo = 'https://search.yahoo.com/search;?p=';
var bing = 'https://www.bing.com/search?q=';
var duck = 'https://duckduckgo.com/?q=';
//editing variables
var editingBkmk;
var imgupdate;
var nameupdate;
var addressupdate;
//dev purposes only
var localURL = window.location.href.slice(0, -10);
var data;
var bgData;

//load user settings
$(document).ready(function () {

    var timer = null;
    var linkDisable = null;
    chrome.storage.local.get('data', function (dataRaw) {
        data = dataRaw.data[0];
        setBG = data.background.backgroundSource;

        $('#bglist').val(setBG);

        if (setBG == 'Unsplash') {
            if (navigator.onLine) {
                unsplash();
            } else {
                offline();
            }

        }
        if (setBG == 'Google Earth View') {
            if (navigator.onLine) {
                gearth();
            } else {
                offline();
            }
        }
        if (setBG == 'Reddit Earth Porn') {
            if (navigator.onLine) {
                reddit();
            } else {
                offline();
            }
        }
        if (setBG == 'Custom') {
            customBG();
        }

        $('#image').fadeIn('slow');
        $('#content').animate({
            opacity: 1
        }, 'fast');
        $('.searchBox').focus();

        setEngineAdd = data.engine.address;
        setEngPlace = data.engine.name;
        $('#searchlist').val(setEngPlace);
        $('.searchBox').attr('placeholder', 'Search ' + setEngPlace);

        bkinfo = data.bookmarks;

        $(bkinfo).each(function (i) {
            $('#bookmarks').append('<a href="' + bkinfo[i].address + '" class="bookmark ' + bkinfo[i].name + '"><div class="editbk"><img src="assets/edit.png"><div class="editmenu"><div class="editbtn">EDIT</div><div class="delbtn">DELETE</div></div></div> <div class="bkimg" style="background-image: url(' + bkinfo[i].img + ')"></div> <p class="name">' + bkinfo[i].name + '</p><div class="address">' + bkinfo[i].address + '</div></div>');
            $('.bookmark').fadeIn('fast');
        });
        loadEdit();
    });
});

function loadEdit() {
    setTimeout(function () {

        $('.bookmark').mousedown(function () {
            timer = setTimeout(editMode, 500);
        });

        $('.bookmark').mouseup(function () {
            clearTimeout(timer);
        });

        function editMode() {
            linkDisable = 1;
            $('#bookmarks').addClass('beginEditing');
            $('.bkimg').addClass('editing');
            $('.editbk').fadeIn('fast');
            $('#bookmarks').sortable({
                tolerance: 'pointer',
                disabled: false
            });

            $('#bookmarks').disableSelection();

            $('.editbk').click(function () {
                $(this).children('.editmenu').slideToggle('fast');
            });
            $('.delbtn').click(function () {
                $(this).parent().parent().parent('.bookmark').fadeOut('fast');
                $(this).parent().parent().parent('.bookmark').remove();
            });
        };

        $(document).click(function (e) {
            if ($(e.target).closest('.bookmark').length > 0 && linkDisable !== null) {
                return false;
            }
            if ($(e.target).closest('#editwrapper').length > 0) {
                return;
            }
            if ($('#bookmarks').hasClass('beginEditing')) {
                linkDisable = null;
                $('.editbk').fadeOut('fast');
                $('.bkimg').removeClass('editing');
                $('#bookmarks').removeClass('beginEditing');
                $('#bookmarks').sortable({
                    disabled: true
                });
                bkinfo = [];
                $('.bookmark').each(function () {
                    var imglink = $(this).children('.bkimg').css('background-image');
                    var httpPrefix = 'http://';
                    var httpsPrefix = 'https://';
                    imglink = imglink.replace('url(', '').replace(')', '').replace(/\"/gi, "");
                    bkinfo.push({
                        name: $(this).children('.name').text(),
                        address: $(this).children('.address').text(),
                        img: imglink
                    });
                });
                getBackground();
                getEngine();
                usrSettings.push({
                    engine: searchinfo,
                    bookmarks: bkinfo,
                    background: bgInfo
                });
                chrome.storage.local.set({
                    data: usrSettings
                }, function () {});
                bkmrkrender.rerender();
            }
        });

        $('.editbtn').click(function () {
            var imgedit = $(this).parent().parent().parent().children('.bkimg').css('background-image');
            imgedit = imgedit.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
            var nameedit = $(this).parent().parent().parent().children('.name').text();
            var addressedit = $(this).parent().parent().parent().children('.address').text();
            $('#editwrapper').fadeIn('fast');
            $('#bkmkimgedit').attr('src', imgedit);
            $('#nameedit').attr('value', nameedit);
            $('#addressedit').attr('value', addressedit);
            editingBkmk = nameedit;
        });

        $('#editclose').click(function () {
            $('#editwrapper').fadeOut('fast');
        });

        $('#bkmkimgedit').click(function () {
            if ($(this).hasClass('choosing')) {
                $(this).removeClass('choosing');
                $('#iconchooseedit').slideUp();
            } else {
                $(this).addClass('choosing');
                $('#iconchooseedit').slideDown();
            }
        });

        $('.choiceedit').click(function () {
            $('.choiceedit').removeClass('selected');
            $('#bkmkimgedit').removeClass('choosing');
            $(this).addClass('selected');
            var img = $(this).css('background-image');
            img = img.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
            $('.toprow').children('#bkmkimgedit').attr('src', img);
            $('#iconchooseedit').slideUp();
        });

        $('#editbkmk').on('submit', function (e) {
            e.preventDefault();
            imgupdate = $(this).children().children('#bkmkimgedit').attr('src');
            imgupdate = imgupdate.replace('url(', '').replace(')', '').replace(/\"/gi, "");
            nameupdate = $(this).children().children('#nameedit').val();
            var httpPrefix = 'http://';
            var httpsPrefix = 'https://';
            if (!($(this).children('#addressedit').val().substr(0, httpPrefix.length) == httpPrefix) && !($(this).children('#addressedit').val().substr(0, httpsPrefix.length) == httpsPrefix)) {
                addressupdate = httpPrefix + $(this).children('#addressedit').val();
            } else {
                addressupdate = $(this).children('#addressedit').val();
            }
            $('#editwrapper').fadeOut('fast');
            $('#editbkmk')[0].reset();
            singlerender.rednersingle();
        });

        var singlerender = new Vue({
            el: '.bookmark',
            methods: {
                rednersingle: function (event) {
                    $('.' + editingBkmk).attr('href', addressupdate);
                    $('.' + editingBkmk).children('.bkimg').css('background-image', 'url(' + imgupdate + ')');
                    $('.' + editingBkmk).children('.name').text(nameupdate);
                    $('.' + editingBkmk).children('.address').text(addressupdate);
                    $('.' + editingBkmk).attr('class', 'bookmark ' + nameupdate);
                    loadEdit();
                }
            }

        });

    }, 500);
};

//create date for cookie
var date = new Date();
date.setTime(date.getTime() + (60 * 60 * 24 * 1000));

//connect to unsplash
function unsplash() {

    var unsplashAPI = 'https://api.unsplash.com/photos/search/?query=nature&client_id=c7f3538249fa7a2878ba0b088bb6b2621265f5beb998daca109210d972d4a45c';

    if ($.cookie('unsplashCookie') === null) {
        $.cookie("unsplashCookie", 1, {
            expires: date
        });
        $.getJSON(unsplashAPI, {})
            .done(function (data) {
                imgarray = [];
                $('#infocontainer').empty();
                $.each(data, function (i, item) {
                    imgarray.push(data[i])
                    chrome.storage.local.set({
                        unsplash: imgarray
                    }, function () {});
                });
                //grab random image
                var image = imgarray[Math.floor(Math.random() * imgarray.length)];
                //push data to page
                $('#image').css('background-image', 'url(' + image.urls.regular + ')');
                $('#infocontainer').attr('href', 'https://unsplash.com/@' + image.user.username + 'utm_source=newstart&utm_medium=referral&utm_campaign=api-credit');
                $('#infocontainer').append('<img id="usrimg" src=' + image.user.profile_image.medium + '>');
                $('#infocontainer').append('<h3>' + image.user.name + '</h3>');
                $('#imginfo').fadeIn();
                $('#infocontainer').fadeIn();
            });
    } else {
        chrome.storage.local.get('unsplash', function (data) {
            imgarray = (data.unsplash);
            //grab random image
            var image = imgarray[Math.floor(Math.random() * imgarray.length)];
            //push data to page
            $('#image').css('background-image', 'url(' + image.urls.regular + ')');
            $('#infocontainer').attr('href', 'https://unsplash.com/@' + image.user.username + 'utm_source=newstart&utm_medium=referral&utm_campaign=api-credit');
            $('#infocontainer').append('<img id="usrimg" src=' + image.user.profile_image.medium + '>');
            $('#infocontainer').append('<h3>' + image.user.name + '</h3>');
            $('#imginfo').fadeIn();
            $('#infocontainer').fadeIn();
        });
    }
}

//offline images
function offline() {
    var offlineLib = ['../assets/offline/1.jpg', '../assets/offline/2.jpg', '../assets/offline/3.jpg', '../assets/offline/4.jpg', '../assets/offline/5.jpg', '../assets/offline/6.jpg', '../assets/offline/7.jpg', '../assets/offline/8.jpg', '../assets/offline/9.jpg', '../assets/offline/10.jpg'];
    imgarray = [];
    $('#infocontainer').empty();
    var image = offlineLib[Math.floor(Math.random() * offlineLib.length)];
    $('#image').css('background-image', 'url(' + image + ')');
    $('#imginfo').fadeOut();
    $('#infocontainer').fadeOut();
}

//connect to Reddit
function reddit() {

    var redditAPI = 'https://www.reddit.com/r/earthporn/top.json?limit=10';

    if ($.cookie('redditCookie') === null) {
        $.cookie("redditCookie", 1, {
            expires: date
        });
        $.getJSON(redditAPI, {})
            .done(function (data) {
                imgarray = [];
                $('#infocontainer').empty();
                data = (data.data.children);
                $.each(data, function (i, item) {
                    if (!(data[i].data.url.match(/\.(jpg|png|gif)/g))) {
                        return;
                    } else {
                        imgarray.push(data[i].data);
                        chrome.storage.local.set({
                            reddit: imgarray
                        }, function () {});
                    }
                });
                //grab random image
                var image = imgarray[Math.floor(Math.random() * imgarray.length)];
                //push data to page
                if (image.url.match('.jpg$')) {
                    $('#image').css('background-image', 'url(' + image.url + ')');
                } else {
                    $('#image').css('background-image', 'url(' + image.url + '.jpg)');

                }
                $('#infocontainer').attr('href', 'https://www.reddit.com/user/' + image.author);
                $('#infocontainer').append('<h3>/u/' + image.author + '</h3>');
                $('#imginfo').fadeIn();
                $('#infocontainer').fadeIn();
            })
    } else {
        chrome.storage.local.get('reddit', function (data) {
            imgarray = (data.reddit);
            //grab random image
            var image = imgarray[Math.floor(Math.random() * imgarray.length)];
            //push data to page
            if (image.url.match('.jpg$')) {
                $('#image').css('background-image', 'url(' + image.url + ')');
            } else {
                $('#image').css('background-image', 'url(' + image.url + '.jpg)');

            }
            $('#infocontainer').attr('href', 'https://www.reddit.com/user/' + image.author);
            $('#infocontainer').append('<h3>/u/' + image.author + '</h3>');
            $('#imginfo').fadeIn();
            $('#infocontainer').fadeIn();
        });
    }
}

//connect to google earth view
function gearth() {

    var gearthAPI = localURL + ('scripts/earthview.json');

        $.getJSON(gearthAPI, {})
            .done(function (data) {
                imgarray = [];
                $('#infocontainer').empty();
                $.each(data, function (i, item) {
                    imgarray.push(data[i])
                });
                //grab random image
                var image = imgarray[Math.floor(Math.random() * imgarray.length)];
                //push data to page
                $('#image').css('background-image', 'url(' + image.image + ')');
                $('#infocontainer').attr('href', image.map);
                $('#infocontainer').append('<h3>' + image.region + ', ' + image.country + '</h3>');
                $('#imginfo').fadeIn();
                $('#infocontainer').fadeIn();
            });
};

//custom background
function customBG() {
    chrome.storage.local.get('customBGData', function (rawBG) {
        imgarray = [];
        $('#infocontainer').empty();
        bgData = rawBG.customBGData;
        $.each(bgData, function (i, item) {
            imgarray.push(bgData[i]);
        });
        var image = imgarray[Math.floor(Math.random() * imgarray.length)];
        $('#image').css('background-image', 'url(' + image + ')');
        $('#imginfo').fadeOut();
        $('#infocontainer').fadeOut();
    });
};

//moment
function timeUpdate() {
    now = moment().format('h:mm a');
    document.getElementById('time').innerHTML = now;
    setTimeout(function () {
        timeUpdate();
    }, 1000);
}
timeUpdate();

function dateUpdate() {
    now = moment().format('dddd, MMMM Do, YYYY');
    document.getElementById('date').innerHTML = now;
    setTimeout(function () {
        dateUpdate();
    }, 1000);
}
dateUpdate();

//background
function getBackground() {
    if ($('#bglist').val() == 'Unsplash') {
        setBG = 'Unsplash';
    }
    if ($('#bglist').val() == 'Google Earth View') {
        setBG = 'Google Earth View';
    }
    if ($('#bglist').val() == 'Reddit Earth Porn') {
        setBG = 'Reddit Earth Porn';
    }
    if ($('#bglist').val() == 'Custom') {
        $('.subrow').slideDown();
        setBG = 'Custom';
    }
    bgInfo = ({
        backgroundSource: setBG
    })
}

//search
function getEngine() {
    if ($('#searchlist').val() == 'Google') {
        setEngine = google;
    }
    if ($('#searchlist').val() == 'Yahoo') {
        setEngine = yahoo;
    }
    if ($('#searchlist').val() == 'Bing') {
        setEngine = bing;
    }
    if ($('#searchlist').val() == 'DuckDuckGo') {
        setEngine = duck;
    }
    searchinfo = ({
        name: $('#searchlist').val(),
        address: setEngine
    })
}

$('#search').on('submit', function (e) {
    e.preventDefault();
    var searchFor = setEngineAdd + $('.searchBox').val()
    window.location.href = searchFor;
});

//assign bookmark imgs to divs
$('.choice').each(function (i) {
    $(this).css('background-image', 'url(' + bkmkimgarray[i % bkmkimgarray.length] + ')')
});

$('.editchoice').each(function (i) {
    $(this).css('background-image', 'url(' + bkmkimgarray[i % bkmkimgarray.length] + ')')
});
$('.choiceedit').each(function (i) {
    $(this).css('background-image', 'url(' + bkmkimgarray[i % bkmkimgarray.length] + ')')
});

$('.choiceedit').each(function (i) {
    $(this).css('background-image', 'url(' + bkmkimgarray[i % bkmkimgarray.length] + ')')
});

//saving/adding bookmark info
$('#addbkmk').on('submit', function (e) {
    e.preventDefault();
    if ($('.bookmark').length > 9) {
        alert('Sorry, for now you can only ad 10 bookmarks!')
    } else {
        var httpPrefix = 'http://';
        var httpsPrefix = 'https://';
        if (!($('#address').val().substr(0, httpPrefix.length) == httpPrefix) && !($('#address').val().substr(0, httpsPrefix.length) == httpsPrefix)) {
            bkinfo.push({
                name: $('#name').val(),
                address: httpPrefix + $('#address').val(),
                img: $('#bkmkimg').attr('src')
            });
        } else {
            bkinfo.push({
                name: $('#name').val(),
                address: $('#address').val(),
                img: $('#bkmkimg').attr('src')
            });
        }
        $('#addbkmk')[0].reset();
        $('#bkmkimg').attr('src', '/assets/icons/holder.png')
        bkmrkrender.addBkmrk();
    }

});

//events
$('#imginfo').click(function () {
    if ($(this).hasClass('infoactive')) {
        $(this).removeClass('infoactive');
        $('.fa-chevron-up').css('transform', 'rotate(0deg)');
        $('#infocontainer').removeClass('infoactive');
    } else {
        $(this).addClass('infoactive');
        $('.fa-chevron-up').css('transform', 'rotate(180deg)');
        $('#infocontainer').addClass('infoactive');
    }
});

$('#menutoggle').click(function () {
    if ($('#maincontainer').hasClass('menuactive')) {
        $('#maincontainer').removeClass('menuactive');
        $('#menutoggle').children().attr('class', 'fa fa-bars fa-3x');
        $('#content').removeClass('contentScale');
        $('#main-wrapper').removeClass('wrapper-open');
        setTimeout(function () {
            $('#main-wrapper').css('transition', 'none');
            $('#maincontainer').css('transition', 'none');
        }, 600);
        $('#menu').removeClass('menuout');
        getEngine();
        getBackground();
        usrSettings.push({
            engine: searchinfo,
            bookmarks: bkinfo,
            background: bgInfo
        });
        chrome.storage.local.set({
            data: usrSettings
        }, function () {});
    } else {
        setTimeout(function () {
            $('#menu').addClass('menuout');
        }, 50);
        $('#maincontainer').addClass('menuactive');
        $('#menutoggle').children().attr('class', 'fa fa-times fa-3x');
        $('#content').addClass('contentScale');
        $('#maincontainer').css('transition', 'ease-in-out all .5s');
        $('#main-wrapper').css('transition', 'ease-in-out width .5s');
        $('#main-wrapper').addClass('wrapper-open');

    }
});

$('.optionsheader').click(function () {
    if ($(this).children('#caret').children('.fa').hasClass('caretopen')) {
        $(this).children('#caret').children('.fa').removeClass('caretopen');
        $(this).parent().children('.optionssection').slideUp();
    } else {
        $(this).children('#caret').children('.fa').addClass('caretopen');
        $(this).parent().children('.optionssection').slideDown();
    }
});

setTimeout(function () {
    $('#edit').click(function () {
        if ($(this).children('#caret').children('.fa').hasClass('caretopen')) {
            $(this).children('#caret').children('.fa').removeClass('caretopen');
            $(this).parent().children('.optionssection').slideUp();
        } else {
            $(this).children('#caret').children('.fa').addClass('caretopen');
            $(this).parent().children('.optionssection').slideDown();
        }
    });

    $('.editicon').click(function () {
        if ($(this).hasClass('open')) {
            $(this).removeClass('open');
            $(this).parent('.toprow').parent('li').children('.subedit').slideUp();
        } else {
            $(this).addClass('open');
            $(this).parent('.toprow').parent('li').children('.subedit').slideDown();
        }
    });

    $('#editimg').click(function () {
        if ($(this).hasClass('choosing')) {
            $(this).removeClass('choosing');
            $('#editchoose').slideUp();
        } else {
            $(this).addClass('choosing');
            $('#editchoose').slideDown();
        }
    });
}, 500);

$('#bkmkimg').click(function () {
    if ($(this).hasClass('choosing')) {
        $(this).removeClass('choosing');
        $('#iconchoose').slideUp();
    } else {
        $(this).addClass('choosing');
        $('#iconchoose').slideDown();
    }
});

$('.choice').click(function () {
    $('.choice').removeClass('selected');
    $('#bkmkimg').removeClass('choosing');
    $(this).addClass('selected');
    var img = $(this).css('background-image');
    img = img.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
    $('#addCustom').change(function () {
        img = $('#addCustom')[0].files[0];
        var reader = new FileReader();
        reader.target_elem = $('#addCustom').parent().parent().parent().children('.toprow').children('#bkmkimg');
        reader.onload = function (e) {
            $(reader.target_elem).attr('src', e.target.result)
        };
        reader.readAsDataURL(img);
    });
    $('.toprow').children('#bkmkimg').attr('src', img);
    $('#iconchoose').slideUp();
});

$('.choiceedit').click(function () {
    $('.choiceedit').removeClass('selected');
    $('#bkmkimgedit').removeClass('choosing');
    $(this).addClass('selected');
    var img = $(this).css('background-image');
    img = img.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
    $('#editCustom').change(function () {
        img = $('#editCustom')[0].files[0];
        var reader = new FileReader();
        reader.target_elem = $('#editCustom').parent().parent().parent().children('.toprow').children('#bkmkimgedit');
        reader.onload = function (e) {
            $(reader.target_elem).attr('src', e.target.result)
        };
        reader.readAsDataURL(img);
    });
    $('.toprow').children('#bkmkimgedit').attr('src', img);
    $('#iconchooseedit').slideUp();
});

var bgArray = [];

function readMultiple(files) {
    var reader = new FileReader();

    function readFile(i) {
        if (i >= files.length) return;

        var file = files[i];
        reader.onload = function (e) {
            bgArray[i] = e.target.result;
            readFile(i + 1)
        }
        reader.readAsDataURL(file);
    }
    readFile(0);
}

$('#custombg').change(function () {
    if ($(this)[0].files.length > 9) {
        alert('Please choose a maximum of 10 images!');
        $(this).val('');
    } else {
        readMultiple(this.files);
        setTimeout(function () {
            chrome.storage.local.set({
                customBGData: bgArray
            }, function () {});
        }, 500)

    }
});

$('#searchlist').click(function () {
    searchrender.updateSearch();
});

$('#bglist').change(function () {
    bgrender.updateBG();
});

var bkmrkrender = new Vue({
    el: '#bookmarks',
    methods: {
        addBkmrk: function (event) {
            var i;
            $('.bookmark').each(function (i) {
                i + 1;
            });
            $('#bookmarks').append('<a href="' + bkinfo[bkinfo.length - 1].address + '" class="bookmark ' + bkinfo[bkinfo.length - 1].name + '"><div class="editbk"><img src="assets/edit.png"><div class="editmenu"><div class="editbtn">EDIT</div><div class="delbtn">DELETE</div></div></div> <div class="bkimg" style="background-image: url(' + bkinfo[bkinfo.length - 1].img + ')"></div> <p class="name">' + bkinfo[bkinfo.length - 1].name + '</p><div class="address">' + bkinfo[bkinfo.length - 1].address + '</div></div>');
            $('.bookmark').fadeIn('fast');
        },
        rerender: function (event) {
            $('#bookmarks').empty();
            $(bkinfo).each(function (i) {
                $('#bookmarks').append('<a href="' + bkinfo[i].address + '" class="bookmark ' + bkinfo[i].name + '"><div class="editbk"><img src="assets/edit.png"><div class="editmenu"><div class="editbtn">EDIT</div><div class="delbtn">DELETE</div></div></div> <div class="bkimg" style="background-image: url(' + bkinfo[i].img + ')"></div> <p class="name">' + bkinfo[i].name + '</p><div class="address">' + bkinfo[i].address + '</div></div>');
                $('.bookmark').fadeIn();
            });
            loadEdit();
        }
    }
});

var searchrender = new Vue({
    el: '.searchBox',
    methods: {
        updateSearch: function (event) {
            if ($('#searchlist').val() == 'Google') {
                setEngineAdd = google;
                $('.searchBox').attr('placeholder', 'Search Google')
            }
            if ($('#searchlist').val() == 'Yahoo') {
                setEngineAdd = yahoo;
                $('.searchBox').attr('placeholder', 'Search Yahoo')
            }
            if ($('#searchlist').val() == 'Bing') {
                setEngineAdd = bing;
                $('.searchBox').attr('placeholder', 'Search Bing')
            }
            if ($('#searchlist').val() == 'DuckDuckGo') {
                setEngineAdd = duck;
                $('.searchBox').attr('placeholder', 'Search DuckDuckGo')
            }
        }
    }
});

var bgrender = new Vue({
    el: '#image',
    methods: {
        updateBG: function (event) {
            if ($('#bglist').val() == 'Unsplash') {
                if (navigator.onLine) {
                    unsplash();
                } else {
                    offline();
                }
            }
            if ($('#bglist').val() == 'Google Earth View') {
                if (navigator.onLine) {
                    gearth();
                } else {
                    offline();
                }
            }
            if ($('#bglist').val() == 'Reddit Earth Porn') {
                if (navigator.onLine) {
                    reddit();
                } else {
                    offline();
                }
            }
            if ($('#bglist').val() == 'Custom') {
                $('.subrow').slideDown({
                    start: function () {
                        $('.subrow').css('display', 'flex');
                    }
                });
                customBG();
            }
        }
    }
});
