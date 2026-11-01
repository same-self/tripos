<?php

namespace App\Models\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * An optional picture for a model that has an `image_path` column (items and services).
 *
 * Files live in storage/app/public/<folder> and are reached through the /storage link
 * (run `php artisan storage:link` once on each machine).
 */
trait HasImage
{
    /** Folder inside storage/app/public, for example "barang". */
    abstract protected function imageFolder(): string;

    public function imageUrl(): ?string
    {
        return $this->image_path ? Storage::disk('public')->url($this->image_path) : null;
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
