using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SongInfoService.Models
{
    public class SongInfo
    {
        public string Album { get; set; }
        public string Comment { get; set; }
        public string Duration { get; set; }
        public string Artist { get; set; }
        public string Genre { get; set; }
        public string Title { get; set; }
        public int Year { get; set; }
        public string URL { get; set; }
    }
}