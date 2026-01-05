<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table réclamations
        Schema::create('reclamations', function (Blueprint $table) {
            $table->id('id_reclamation');
            $table->unsignedBigInteger('id_etudiant');
            $table->unsignedBigInteger('id_matiere');
            $table->text('motif');
            $table->decimal('note_actuelle', 5, 2)->nullable();
            $table->decimal('note_souhaitee', 5, 2)->nullable();
            $table->decimal('note_corrigee', 5, 2)->nullable();
            
            $table->enum('statut', [
                'SOUMISE',
                'REJETEE',
                'VALIDEE', 
                'NON_VALIDEE',
                'TERMINEE'
            ])->default('SOUMISE');
            
            $table->enum('etape_actuelle', [
                'SCOLARITE',
                'DIRECTEUR_ACADEMIQUE', 
                'ENSEIGNANT',
                'DIRECTEUR_ADJOINT'
            ])->default('SCOLARITE');
            
            $table->text('decision')->nullable();
            $table->timestamp('date_depot')->useCurrent();
            $table->timestamp('date_traitement')->nullable();
            $table->timestamps();
            
            $table->foreign('id_etudiant')->references('id_etudiant')->on('etudiants');
            $table->foreign('id_matiere')->references('id_matiere')->on('matieres');
        });

        // Table pièces jointes
        Schema::create('pieces_jointes', function (Blueprint $table) {
            $table->id('id_piece');
            $table->unsignedBigInteger('id_reclamation');
            $table->string('nom_fichier');
            $table->string('type_fichier', 50)->nullable();
            $table->string('chemin_fichier');
            $table->timestamp('date_upload')->useCurrent();
            $table->timestamps();
            
            $table->foreign('id_reclamation')->references('id_reclamation')->on('reclamations')->onDelete('cascade');
        });

        // Table historique
        Schema::create('historique_actions', function (Blueprint $table) {
            $table->id('id_action');
            $table->unsignedBigInteger('id_reclamation');
            $table->unsignedBigInteger('id_utilisateur');
            $table->string('action');
            $table->text('commentaire')->nullable();
            $table->timestamp('date_action')->useCurrent();
            $table->timestamps();
            
            $table->foreign('id_reclamation')->references('id_reclamation')->on('reclamations');
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('utilisateurs');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historique_actions');
        Schema::dropIfExists('pieces_jointes');
        Schema::dropIfExists('reclamations');
    }
};