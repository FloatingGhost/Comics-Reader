<?php

class Image
{

    var $image_file;
    var $image_dir;

    var $image;
    var $thumb;

    public $type;

    function __construct($path)
    {
        @ini_set("memory_limit", "80M");
        $path = '/' . $path;

        $this->image_dir = gal_dir_name($path);
        $this->image_file = str_replace($this->image_dir, '', $path);


        $this->type = self::type($this->image_file);

        switch ($this->type) {
            case 'jpeg':
                $this->image = imagecreatefromjpeg(GALLERY_ROOT . $path);
                break;
            case 'png':
                $this->image = imagecreatefrompng(GALLERY_ROOT . $path);
                break;
            case 'gif':
                $this->image = imagecreatefromgif(GALLERY_ROOT . $path);
                break;
            default:
                exit;
                break;
        }

        if (!$this->image) {
            return false;
        }
    }

    static function type($file)
    {
        $type = strtolower(substr($file, strrpos($file, ".")));
        if (($type == ".jpg") or ($type == ".jpeg")) {
            return "jpeg";
        } elseif ($type == ".png") {
            return "png";
        } elseif ($type == ".gif") {
            return "gif";
        }
        return FALSE;
    }

    function size()
    {
        return getimagesize(GALLERY_ROOT . $this->image_dir . $this->image_file);
    }

    function ratio_calculation($width, $height)
    {
        //Width and Height
        list($image_width, $image_height) = $this->size();

        //si l'originale est plus petite que la miniature
        if (($image_width < $width) and ($image_height < $height) and !ENLARGE_SMALL_IMAGES) {
            $thumb_height = $image_height;
            $thumb_width = $image_width;
        } else {
            $aspect_x = $image_width / $width;
            $aspect_y = $image_height / $height;

            //si la largeur est plus grande que la hauteur
            if ($aspect_x > $aspect_y) {
                $thumb_width = $width;
                $thumb_height = $image_height / $aspect_x;
            } else { //si la hauteur est plus grande que la largeur
                $thumb_height = $height;
                $thumb_width = $image_width / $aspect_y;
            }
        }

        return array($thumb_width, $thumb_height);
    }

    function cropped_ratio_calculation($width, $height)
    {
        //Width and Height
        list($image_width, $image_height) = getimagesize(GALLERY_ROOT . $this->image_dir . $this->image_file);

        //si l'originale est plus petite que la miniature
        if (($image_width < $width) and ($image_height < $height) and !ENLARGE_SMALL_IMAGES) {
            $thumb_height = $image_height;
            $thumb_width = $image_width;
        } else {
            $aspect_x = $image_width / $width;

            $thumb_width = $width;
            $thumb_height = round($image_height / $aspect_x);

            //Dans les rares cas ou l'image donne une hauteur plus petite
            if ($thumb_height < $height) {
                $aspect_y = $image_height / $height;

                $thumb_width = $image_width / $aspect_y;
                $thumb_height = $height;
            }
        }
        return array($thumb_width, $thumb_height);
    }

    public function create_thumb($width, $height)
    {
        $this->thumb = imagecreatetruecolor($width, $height);

        $imgx = imagesx($this->image);
        $imgy = imagesy($this->image);

        imagecopyresampled($this->thumb, $this->image, 0, 0, 0, 0, $width, $height, $imgx, $imgy);
        imagedestroy($this->image);
    }

    public function crop_thumb($width, $height, $crop_width, $crop_height)
    {
        if ($width != $crop_width) {
            $x_pos = ceil(($width - $crop_width) / 2);
        } else {
            $x_pos = 0;
        }

        if ($height != $crop_height) {
            $y_pos = ceil(($height - $crop_height) / 2);
        } else {
            $y_pos = 0;
        }

        $thumb = imagecreatetruecolor($crop_width, $crop_height);
        imagecopy($thumb, $this->thumb, 0, 0, $x_pos, $y_pos, $width, $height);;

        imagedestroy($this->thumb);
        $this->thumb = $thumb;
    }

    public function write_file($folder)
    {
        if (!is_dir($folder . $this->image_dir)) {
            gal_dir_make($folder . $this->image_dir);
        }

        $thumb_file = str_replace('//', '/', $folder . $this->image_dir . $this->image_file);

        $this->write($thumb_file);
    }

    public function output()
    {
        header("Content-type: image/" . $this->type);
        $this->write();
    }

    protected function write($destination = null)
    {
        switch ($this->type) {
            case 'jpeg':
                imagejpeg($this->thumb, $destination, JPEG_QUALITY);
                break;
            case 'png':
                imagepng($this->thumb, $destination);
                break;
            case 'gif':
                imagegif($this->thumb, $destination);
                break;
        }
    }

    function destroy()
    {
        imagedestroy($this->thumb);
    }
}
