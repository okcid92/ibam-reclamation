<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enseignants', function (Blueprint $table) {
            $table->id('id_enseignant');
            $table->unsignedBigInteger('id_utilisateur');
            $table->string('specialite', 100)->nullable();
            $table->timestamps();

            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('utilisateurs')->onDelete('cascade');
        });

        Schema::create('matieres', function (Blueprint $table) {
            $table->id('id_matiere');
            $table->string('code_matiere', 50)->unique();
            $table->string('libelle', 150);
            $table->timestamps();
        });

        Schema::create('enseignant_matieres', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_enseignant');
            $table->unsignedBigInteger('id_matiere');
            $table->timestamps();

            $table->foreign('id_enseignant')->references('id_enseignant')->on('enseignants');
            $table->foreign('id_matiere')->references('id_matiere')->on('matieres');
            $table->unique(['id_enseignant', 'id_matiere']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enseignant_matieres');
        Schema::dropIfExists('matieres');
        Schema::dropIfExists('enseignants');
    }
};