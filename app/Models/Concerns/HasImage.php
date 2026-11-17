<?php

namespace App\Models\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * An optional picture for a model that has an `image_path` column (items and services).
 *
 * Files live in storage/app/public/<folder> and are served by the app through the "media" route,
 * so no `php artisan storage:link` is needed.
 */
trait HasImage
{
    /** Folder inside storage/app/public, for example "barang". */
    abstract protected function imageFolder(): string;

    /**
     * Relative address such as /media/barang/abc.jpg (see the "media" route in routes/web.php).
     * Relative, so it works on localhost:8000, 127.0.0.1, tripos.test or a real domain alike.
     */
    public function imageUrl(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        $base = rtrim((string) parse_url((string) config('app.url'), PHP_URL_PATH), '/');

        return $base . route('media', ['path' => $this->image_path], absolute: false);
    }

    /** Saves the new file first, then removes the old one, so a failed upload never loses the old picture. */
    public function replaceImage(UploadedFile $file): void
    {
        $old = $this->image_path;

        $this->forceFill(['image_path' => $file->store($this->imageFolder(), 'public')])->save();

        $this->deleteStoredFile($old);
    }

    public function removeImage(): void
    {
        $old = $this->image_path;

        $this->forceFill(['image_path' => null])->save();

        $this->deleteStoredFile($old);
    }

    private function deleteStoredFile(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
