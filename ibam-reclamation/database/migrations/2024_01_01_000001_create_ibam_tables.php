<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table Etudiants
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('ine')->unique();
            $table->string('sector')->nullable(); // Filiere
            $table->string('level')->nullable(); // Niveau
            $table->timestamps();
        });

        // Table Enseignants
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('specialty')->nullable();
            $table->timestamps();
        });

        // Table Matières
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('label');
            $table->timestamps();
        });

        // Pivot Enseignants <-> Matières
        Schema::create('teacher_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->unique(['teacher_id', 'subject_id']);
        });

        // Table Réclamations
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects');
            $table->text('reason'); // Motif
            $table->decimal('initial_grade', 5, 2)->nullable();
            $table->decimal('corrected_grade', 5, 2)->nullable();
            
            $table->enum('status', [
                'soumise', 
                'en_cours', 
                'en_attente_information', 
                'validee', 
                'rejetee', 
                'cloturee'
            ])->default('soumise');

            $table->enum('current_stage', [
                'SCOLARITE',
                'ENSEIGNANT',
                'DIRECTEUR_ACADEMIQUE'
            ])->default('SCOLARITE');

            $table->text('decision')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        // Table Pièces Jointes
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained('claims')->onDelete('cascade');
            $table->string('filename');
            $table->string('filepath');
            $table->string('filetype')->nullable();
            $table->timestamps();
        });

        // Table Historique
        Schema::create('claim_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained('claims')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->string('action');
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claim_history');
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('claims');
        Schema::dropIfExists('teacher_subjects');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('students');
    }
};
